package com.musclemap.catalog;

import com.musclemap.catalog.dto.ExerciseResponse;
import com.musclemap.catalog.dto.MediaResponse;
import com.musclemap.catalog.dto.MuscleInvolvementResponse;
import com.musclemap.catalog.dto.MuscleResponse;

/** Entity -> response mapping for the catalogue. Pure; runs inside a read tx. */
final class CatalogMapper {

    private CatalogMapper() {
    }

    static MuscleResponse toResponse(Muscle muscle) {
        return new MuscleResponse(muscle.getId(), muscle.getName(), muscle.getGroup());
    }

    static ExerciseResponse toResponse(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getMuscles().stream().map(CatalogMapper::toResponse).toList(),
                exercise.getCategory(),
                exercise.getLevel(),
                exercise.getEquipment(),
                exercise.getMechanic(),
                exercise.getForce(),
                exercise.getInstructions().stream().toList(),
                exercise.getMedia().stream().map(CatalogMapper::toResponse).toList());
    }

    private static MuscleInvolvementResponse toResponse(MuscleInvolvement involvement) {
        return new MuscleInvolvementResponse(
                involvement.getMuscleId(), involvement.getRole(), involvement.getContribution());
    }

    private static MediaResponse toResponse(ExerciseMedia media) {
        return new MediaResponse(media.getKind(), media.getSource(), media.getUrl(), media.getThumbnailUrl());
    }
}
