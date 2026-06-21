package com.musclemap.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Shape of a record in the bundled free-exercise-db dataset
 * ({@code catalog/exercises.json}). Nullable fields mirror the source. Translated
 * into our {@link Exercise} by {@link CatalogBootstrap} at seed time.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
record RawExercise(
        String id,
        String name,
        String force,
        String level,
        String mechanic,
        String equipment,
        List<String> primaryMuscles,
        List<String> secondaryMuscles,
        List<String> instructions,
        String category,
        List<String> images) {

    List<String> primaryMusclesOrEmpty() {
        return primaryMuscles != null ? primaryMuscles : List.of();
    }

    List<String> secondaryMusclesOrEmpty() {
        return secondaryMuscles != null ? secondaryMuscles : List.of();
    }

    List<String> instructionsOrEmpty() {
        return instructions != null ? instructions : List.of();
    }

    List<String> imagesOrEmpty() {
        return images != null ? images : List.of();
    }
}
