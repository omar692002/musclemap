package com.musclemap.catalog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.musclemap.catalog.ExerciseCategory;
import com.musclemap.catalog.ExerciseForce;
import com.musclemap.catalog.ExerciseLevel;
import com.musclemap.catalog.ExerciseMechanic;
import com.musclemap.user.Equipment;

import java.util.List;

/**
 * An exercise, shaped to match the frontend {@code Exercise} domain model field
 * for field. Optional source attributes ({@code equipment}/{@code mechanic}/
 * {@code force}) are omitted when null so they map onto the frontend optionals.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ExerciseResponse(
        String id,
        String name,
        List<MuscleInvolvementResponse> muscles,
        ExerciseCategory category,
        ExerciseLevel level,
        Equipment equipment,
        ExerciseMechanic mechanic,
        ExerciseForce force,
        List<String> instructions,
        List<MediaResponse> media) {
}
