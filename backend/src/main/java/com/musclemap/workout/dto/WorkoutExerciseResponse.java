package com.musclemap.workout.dto;

import com.musclemap.workout.WorkoutExercise;

import java.math.BigDecimal;
import java.util.UUID;

/** Public view of one logged exercise within a session (EM6). */
public record WorkoutExerciseResponse(
        UUID id,
        String exerciseRef,
        String exerciseName,
        int position,
        Integer sets,
        Integer reps,
        BigDecimal weightKg,
        BigDecimal rpe,
        boolean completed) {

    public static WorkoutExerciseResponse from(WorkoutExercise exercise) {
        return new WorkoutExerciseResponse(
                exercise.getId(),
                exercise.getExerciseRef(),
                exercise.getExerciseName(),
                exercise.getPosition(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getWeightKg(),
                exercise.getRpe(),
                exercise.isCompleted());
    }
}
