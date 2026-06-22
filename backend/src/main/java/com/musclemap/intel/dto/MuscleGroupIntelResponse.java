package com.musclemap.intel.dto;

import com.musclemap.catalog.MuscleGroup;
import com.musclemap.intel.MuscleReadiness;
import com.musclemap.intel.RecoveryAdvice;
import com.musclemap.intel.TrainingStatus;

/** Full intelligence readout for one muscle group. */
public record MuscleGroupIntelResponse(
        MuscleGroup group,
        double weeklyEffectiveSets,
        RoleBreakdownResponse roleBreakdown,
        VolumeLandmarksResponse landmarks,
        TrainingStatus trainingStatus,
        String lastTrainedAt,
        Double hoursSinceLast,
        double recoveryPct,
        MuscleReadiness readiness,
        RecoveryAdvice advice
) {}
