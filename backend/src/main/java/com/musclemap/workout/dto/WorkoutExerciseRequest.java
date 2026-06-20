package com.musclemap.workout.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * One exercise as performed within a tracked session (EM6). {@code exerciseRef}
 * is the frontend's static-dataset id (free-exercise-db) — the rich catalogue
 * stays on the client; the backend only records what was actually done.
 */
public record WorkoutExerciseRequest(
        @NotBlank @Size(max = 160) String exerciseRef,
        @Size(max = 200) String exerciseName,
        @PositiveOrZero Integer position,
        @PositiveOrZero Integer sets,
        @PositiveOrZero Integer reps,
        @PositiveOrZero @DecimalMax("9999.99") BigDecimal weightKg,
        @DecimalMin("0.0") @DecimalMax("10.0") BigDecimal rpe,
        boolean completed) {
}
