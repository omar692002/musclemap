package com.musclemap.workout;

import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import com.musclemap.workout.dto.WorkoutExerciseRequest;
import com.musclemap.workout.dto.WorkoutSessionRequest;
import com.musclemap.workout.dto.WorkoutSessionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Default {@link WorkoutSessionService}. A session is built from the client's
 * payload with its exercises as cascaded children; ownership is enforced on
 * every read/delete by checking the session's user against the caller (a
 * mismatch is surfaced as a 404, never leaking another user's ids).
 */
@Service
public class WorkoutSessionServiceImpl implements WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public WorkoutSessionServiceImpl(WorkoutSessionRepository sessionRepository,
                                     UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public WorkoutSessionResponse create(UUID userId, WorkoutSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setName(request.name());
        session.setFocus(request.focus());
        session.setStatus(request.status() != null ? request.status() : SessionStatus.COMPLETED);
        session.setStartedAt(request.startedAt());
        session.setCompletedAt(request.completedAt());
        session.setDurationSeconds(request.durationSeconds());
        session.setNotes(request.notes());

        int position = 0;
        for (WorkoutExerciseRequest item : request.exercises()) {
            session.getExercises().add(toExercise(session, item, position++));
        }

        return WorkoutSessionResponse.from(sessionRepository.save(session));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkoutSessionResponse> listForUser(UUID userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(WorkoutSessionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WorkoutSessionResponse getForUser(UUID userId, UUID sessionId) {
        return WorkoutSessionResponse.from(ownedSession(userId, sessionId));
    }

    @Override
    @Transactional
    public void deleteForUser(UUID userId, UUID sessionId) {
        sessionRepository.delete(ownedSession(userId, sessionId));
    }

    /** Loads a session and verifies the caller owns it; 404 otherwise. */
    private WorkoutSession ownedSession(UUID userId, UUID sessionId) {
        WorkoutSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> ResourceNotFoundException.of("WorkoutSession", sessionId));
        if (!session.getUser().getId().equals(userId)) {
            // Don't reveal that the id exists for another user.
            throw ResourceNotFoundException.of("WorkoutSession", sessionId);
        }
        return session;
    }

    private WorkoutExercise toExercise(WorkoutSession session, WorkoutExerciseRequest item, int fallbackPosition) {
        WorkoutExercise exercise = new WorkoutExercise();
        exercise.setSession(session);
        exercise.setExerciseRef(item.exerciseRef());
        exercise.setExerciseName(item.exerciseName());
        exercise.setPosition(item.position() != null ? item.position() : fallbackPosition);
        exercise.setSets(item.sets());
        exercise.setReps(item.reps());
        exercise.setWeightKg(item.weightKg());
        exercise.setRpe(item.rpe());
        exercise.setCompleted(item.completed());
        return exercise;
    }
}
