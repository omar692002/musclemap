package com.musclemap.user;

/**
 * Primary training objective. Persisted as name(); shared by user_profiles.training_goal
 * and generated_programs.goal CHECK constraints.
 */
public enum TrainingGoal {
    BUILD_MUSCLE,
    LOSE_FAT,
    GAIN_STRENGTH,
    IMPROVE_ENDURANCE,
    GENERAL_FITNESS
}
