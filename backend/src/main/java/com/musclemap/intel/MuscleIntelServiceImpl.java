package com.musclemap.intel;

import com.musclemap.catalog.Exercise;
import com.musclemap.catalog.ExerciseRepository;
import com.musclemap.catalog.Muscle;
import com.musclemap.catalog.MuscleGroup;
import com.musclemap.catalog.MuscleRepository;
import com.musclemap.catalog.MuscleRole;
import com.musclemap.intel.dto.MuscleGroupIntelResponse;
import com.musclemap.intel.dto.MuscleIntelSummaryResponse;
import com.musclemap.intel.dto.RoleBreakdownResponse;
import com.musclemap.intel.dto.VolumeLandmarksResponse;
import com.musclemap.workout.SessionStatus;
import com.musclemap.workout.WorkoutExercise;
import com.musclemap.workout.WorkoutSession;
import com.musclemap.workout.WorkoutSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Ports the EM8 muscle-intelligence engine from the frontend to the backend.
 * Same algorithm: rolling 7-day effective sets vs MEV/MAV/MRV landmarks, plus
 * a recovery model based on time since last stimulus scaled by session load.
 */
@Service
@Transactional(readOnly = true)
public class MuscleIntelServiceImpl implements MuscleIntelService {

    // --- Config constants (mirrors muscleIntel.config.ts) ---
    private static final int WINDOW_DAYS = 7;
    private static final double REFERENCE_SESSION_LOAD = 6.0;
    private static final double LOAD_FACTOR_MIN = 0.6;
    private static final double LOAD_FACTOR_MAX = 1.5;
    private static final double READY_PCT = 90.0;
    private static final double RECOVERING_PCT = 50.0;

    // Default per-role contribution when the exercise has no explicit value.
    private static final Map<MuscleRole, Double> ROLE_DEFAULT_CONTRIBUTION = Map.of(
            MuscleRole.PRIMARY, 1.0,
            MuscleRole.SECONDARY, 0.5,
            MuscleRole.STABILIZER, 0.25
    );

    // Groups shown on the intel page, in display order.
    private static final List<MuscleGroup> INTEL_GROUPS = List.of(
            MuscleGroup.CHEST,
            MuscleGroup.BACK,
            MuscleGroup.SHOULDERS,
            MuscleGroup.BICEPS,
            MuscleGroup.TRICEPS,
            MuscleGroup.FOREARMS,
            MuscleGroup.CORE,
            MuscleGroup.QUADRICEPS,
            MuscleGroup.HAMSTRINGS,
            MuscleGroup.GLUTES,
            MuscleGroup.CALVES
    );

    // Per-group model: landmarks (mev/mav/mrv) + base recovery hours.
    private record GroupModel(int mev, int mav, int mrv, int recoveryHours) {}

    private static final Map<MuscleGroup, GroupModel> GROUP_MODELS = new EnumMap<>(MuscleGroup.class);
    static {
        GROUP_MODELS.put(MuscleGroup.CHEST,      new GroupModel(10, 16, 22, 48));
        GROUP_MODELS.put(MuscleGroup.BACK,       new GroupModel(10, 18, 25, 56));
        GROUP_MODELS.put(MuscleGroup.SHOULDERS,  new GroupModel(8,  16, 22, 48));
        GROUP_MODELS.put(MuscleGroup.BICEPS,     new GroupModel(8,  14, 20, 48));
        GROUP_MODELS.put(MuscleGroup.TRICEPS,    new GroupModel(8,  14, 18, 48));
        GROUP_MODELS.put(MuscleGroup.FOREARMS,   new GroupModel(6,  10, 16, 36));
        GROUP_MODELS.put(MuscleGroup.CORE,       new GroupModel(8,  16, 25, 24));
        GROUP_MODELS.put(MuscleGroup.QUADRICEPS, new GroupModel(8,  16, 20, 60));
        GROUP_MODELS.put(MuscleGroup.HAMSTRINGS, new GroupModel(6,  14, 20, 60));
        GROUP_MODELS.put(MuscleGroup.GLUTES,     new GroupModel(4,  12, 16, 48));
        GROUP_MODELS.put(MuscleGroup.CALVES,     new GroupModel(8,  16, 22, 36));
        GROUP_MODELS.put(MuscleGroup.NECK,       new GroupModel(4,  8,  12, 24));
        GROUP_MODELS.put(MuscleGroup.ADDUCTORS,  new GroupModel(4,  8,  12, 36));
        GROUP_MODELS.put(MuscleGroup.ABDUCTORS,  new GroupModel(4,  8,  12, 36));
    }

    // Running accumulator per muscle group while folding over the history.
    private static class GroupAcc {
        double weekly = 0;
        final Map<MuscleRole, Double> byRole = new EnumMap<>(MuscleRole.class);
        Long lastAtMs = null;
        double lastLoad = 0;

        GroupAcc() {
            for (MuscleRole r : MuscleRole.values()) byRole.put(r, 0.0);
        }
    }

    private final WorkoutSessionRepository sessionRepository;
    private final ExerciseRepository exerciseRepository;
    private final MuscleRepository muscleRepository;

    public MuscleIntelServiceImpl(WorkoutSessionRepository sessionRepository,
                                  ExerciseRepository exerciseRepository,
                                  MuscleRepository muscleRepository) {
        this.sessionRepository = sessionRepository;
        this.exerciseRepository = exerciseRepository;
        this.muscleRepository = muscleRepository;
    }

    @Override
    public MuscleIntelSummaryResponse compute(UUID userId) {
        Instant now = Instant.now();
        long nowMs = now.toEpochMilli();
        long cutoffMs = nowMs - (long) WINDOW_DAYS * 24 * 60 * 60 * 1000;

        // 1. Fetch all completed sessions with a valid completedAt.
        List<WorkoutSession> sessions = sessionRepository
                .findByUserIdAndStatus(userId, SessionStatus.COMPLETED)
                .stream()
                .filter(s -> s.getCompletedAt() != null)
                .toList();

        // 2. Collect all unique exerciseRefs so we can batch-fetch from catalog.
        Set<String> exerciseRefs = sessions.stream()
                .flatMap(s -> s.getExercises().stream())
                .filter(WorkoutExercise::isCompleted)
                .map(WorkoutExercise::getExerciseRef)
                .collect(Collectors.toSet());

        Map<String, Exercise> exerciseIndex = new HashMap<>();
        exerciseRepository.findAllById(exerciseRefs)
                .forEach(e -> exerciseIndex.put(e.getId(), e));

        // 3. Build muscle-id → group index.
        Map<String, MuscleGroup> muscleGroupIndex = new HashMap<>();
        muscleRepository.findAll()
                .forEach(m -> muscleGroupIndex.put(m.getId(), m.getGroup()));

        // 4. Fold over sessions.
        Map<MuscleGroup, GroupAcc> accByGroup = new EnumMap<>(MuscleGroup.class);

        for (WorkoutSession session : sessions) {
            long sessionMs = session.getCompletedAt().toEpochMilli();
            boolean inWindow = sessionMs >= cutoffMs;

            // Per-group load for THIS session (drives recovery calc).
            Map<MuscleGroup, Double> sessionLoad = new EnumMap<>(MuscleGroup.class);

            for (WorkoutExercise we : session.getExercises()) {
                if (!we.isCompleted()) continue;
                int sets = we.getSets() != null ? we.getSets() : 0;
                if (sets <= 0) continue;

                Exercise exercise = exerciseIndex.get(we.getExerciseRef());
                if (exercise == null) continue;

                for (var inv : exercise.getMuscles()) {
                    MuscleGroup group = muscleGroupIndex.get(inv.getMuscleId());
                    if (group == null) continue;

                    double contribution = inv.getContribution() != null
                            ? inv.getContribution().doubleValue()
                            : ROLE_DEFAULT_CONTRIBUTION.getOrDefault(inv.getRole(), 1.0);
                    double effective = sets * contribution;

                    sessionLoad.merge(group, effective, Double::sum);

                    if (inWindow) {
                        GroupAcc acc = accByGroup.computeIfAbsent(group, g -> new GroupAcc());
                        acc.weekly += effective;
                        acc.byRole.merge(inv.getRole(), effective, Double::sum);
                    }
                }
            }

            // Record this session as the latest stimulus for each group it hit.
            for (Map.Entry<MuscleGroup, Double> entry : sessionLoad.entrySet()) {
                GroupAcc acc = accByGroup.computeIfAbsent(entry.getKey(), g -> new GroupAcc());
                if (acc.lastAtMs == null || sessionMs > acc.lastAtMs) {
                    acc.lastAtMs = sessionMs;
                    acc.lastLoad = entry.getValue();
                }
            }
        }

        // 5. Build per-group readouts in display order.
        List<MuscleGroupIntelResponse> groups = INTEL_GROUPS.stream()
                .map(group -> buildGroupIntel(group, accByGroup.get(group), nowMs))
                .toList();

        long overtrainedCount = groups.stream().filter(g -> g.trainingStatus() == TrainingStatus.OVERTRAINED).count();
        long undertrainedCount = groups.stream().filter(g ->
                g.trainingStatus() == TrainingStatus.UNDERTRAINED || g.trainingStatus() == TrainingStatus.UNTRAINED).count();
        long readyCount = groups.stream().filter(g -> g.readiness() == MuscleReadiness.READY).count();
        boolean hasData = groups.stream().anyMatch(g -> g.lastTrainedAt() != null);

        return new MuscleIntelSummaryResponse(hasData, groups, overtrainedCount, undertrainedCount, readyCount);
    }

    private MuscleGroupIntelResponse buildGroupIntel(MuscleGroup group, GroupAcc acc, long nowMs) {
        if (acc == null) acc = new GroupAcc();
        GroupModel model = GROUP_MODELS.get(group);
        if (model == null) model = new GroupModel(6, 12, 18, 48);

        TrainingStatus status = classifyVolume(acc.weekly, model);

        Double hoursSinceLast = null;
        double recoveryPct = 100.0;
        String lastTrainedAt = null;

        if (acc.lastAtMs != null) {
            lastTrainedAt = Instant.ofEpochMilli(acc.lastAtMs).toString();
            hoursSinceLast = (nowMs - acc.lastAtMs) / 3_600_000.0;
            double loadFactor = clamp(acc.lastLoad / REFERENCE_SESSION_LOAD, LOAD_FACTOR_MIN, LOAD_FACTOR_MAX);
            double neededHours = model.recoveryHours() * loadFactor;
            recoveryPct = clamp((hoursSinceLast / neededHours) * 100.0, 0.0, 100.0);
        }

        MuscleReadiness readiness = classifyReadiness(recoveryPct);
        RecoveryAdvice advice = adviceFor(status, readiness);

        return new MuscleGroupIntelResponse(
                group,
                acc.weekly,
                new RoleBreakdownResponse(
                        acc.byRole.getOrDefault(MuscleRole.PRIMARY, 0.0),
                        acc.byRole.getOrDefault(MuscleRole.SECONDARY, 0.0),
                        acc.byRole.getOrDefault(MuscleRole.STABILIZER, 0.0)
                ),
                new VolumeLandmarksResponse(model.mev(), model.mav(), model.mrv()),
                status,
                lastTrainedAt,
                hoursSinceLast,
                recoveryPct,
                readiness,
                advice
        );
    }

    private static TrainingStatus classifyVolume(double weekly, GroupModel model) {
        if (weekly <= 0) return TrainingStatus.UNTRAINED;
        if (weekly < model.mev()) return TrainingStatus.UNDERTRAINED;
        if (weekly > model.mrv()) return TrainingStatus.OVERTRAINED;
        return TrainingStatus.OPTIMAL;
    }

    private static MuscleReadiness classifyReadiness(double recoveryPct) {
        if (recoveryPct >= READY_PCT) return MuscleReadiness.READY;
        if (recoveryPct >= RECOVERING_PCT) return MuscleReadiness.RECOVERING;
        return MuscleReadiness.FATIGUED;
    }

    private static RecoveryAdvice adviceFor(TrainingStatus status, MuscleReadiness readiness) {
        if (status == TrainingStatus.OVERTRAINED) return RecoveryAdvice.REDUCE_VOLUME;
        if (readiness != MuscleReadiness.READY) return RecoveryAdvice.KEEP_RESTING;
        if (status == TrainingStatus.UNTRAINED || status == TrainingStatus.UNDERTRAINED) return RecoveryAdvice.ADD_VOLUME;
        return RecoveryAdvice.GOOD_TO_TRAIN;
    }

    private static double clamp(double value, double min, double max) {
        return Math.min(max, Math.max(min, value));
    }
}
