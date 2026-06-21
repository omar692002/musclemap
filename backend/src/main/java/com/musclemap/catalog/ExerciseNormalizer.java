package com.musclemap.catalog;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Transforms raw free-exercise-db records into {@link Exercise} entities: maps
 * the source vocabulary onto our enums/taxonomy, derives muscle involvements
 * (primary/secondary) with default contributions, resolves image paths against
 * the CDN, and prepends a curated YouTube demo video when one exists. Mirrors the
 * frontend {@code ExerciseNormalizer} so the API and the static fallback agree.
 *
 * <p>Unknown source values fail fast (an {@link IllegalStateException}) rather
 * than silently producing a NULL — that surfaces dataset drift at boot.</p>
 */
class ExerciseNormalizer {

    private final CatalogProperties properties;
    private final Map<String, String> videoIds;

    ExerciseNormalizer(CatalogProperties properties, Map<String, String> videoIds) {
        this.properties = properties;
        this.videoIds = videoIds;
    }

    Exercise normalize(RawExercise raw) {
        Exercise exercise = new Exercise();
        exercise.setId(raw.id());
        exercise.setName(raw.name());
        exercise.setCategory(require(CatalogTaxonomy.SOURCE_CATEGORY, raw.category(), "category"));
        exercise.setLevel(require(CatalogTaxonomy.SOURCE_LEVEL, raw.level(), "level"));
        exercise.setEquipment(optional(CatalogTaxonomy.SOURCE_EQUIPMENT, raw.equipment(), "equipment"));
        exercise.setMechanic(optional(CatalogTaxonomy.SOURCE_MECHANIC, raw.mechanic(), "mechanic"));
        exercise.setForce(optional(CatalogTaxonomy.SOURCE_FORCE, raw.force(), "force"));
        exercise.setInstructions(new ArrayList<>(raw.instructionsOrEmpty()));
        exercise.setMuscles(toInvolvements(raw));
        exercise.setMedia(toMedia(raw));
        return exercise;
    }

    private List<MuscleInvolvement> toInvolvements(RawExercise raw) {
        List<MuscleInvolvement> involvements = new ArrayList<>();
        for (String source : raw.primaryMusclesOrEmpty()) {
            involvements.add(involvement(source, MuscleRole.PRIMARY));
        }
        for (String source : raw.secondaryMusclesOrEmpty()) {
            involvements.add(involvement(source, MuscleRole.SECONDARY));
        }
        return involvements;
    }

    private MuscleInvolvement involvement(String sourceMuscle, MuscleRole role) {
        String muscleId = CatalogTaxonomy.SOURCE_MUSCLE_TO_ID.get(sourceMuscle);
        if (muscleId == null) {
            throw new IllegalStateException("Unknown source muscle: " + sourceMuscle);
        }
        return new MuscleInvolvement(muscleId, role, CatalogTaxonomy.ROLE_DEFAULT_CONTRIBUTION.get(role));
    }

    /** A curated demo video (if any) first, then the source images. */
    private List<ExerciseMedia> toMedia(RawExercise raw) {
        List<ExerciseMedia> media = new ArrayList<>();
        String videoId = videoIds.get(raw.id());
        if (videoId != null && !videoId.isBlank()) {
            media.add(new ExerciseMedia(MediaKind.VIDEO, MediaSource.YOUTUBE, videoId,
                    properties.youtubeThumbnailUrl(videoId)));
        }
        for (String path : raw.imagesOrEmpty()) {
            media.add(new ExerciseMedia(MediaKind.IMAGE, MediaSource.FILE, properties.imageUrl(path), null));
        }
        return media;
    }

    private static <T> T require(Map<String, T> table, String key, String field) {
        T value = table.get(key);
        if (value == null) {
            throw new IllegalStateException("Unknown exercise " + field + ": " + key);
        }
        return value;
    }

    private static <T> T optional(Map<String, T> table, String key, String field) {
        if (key == null) {
            return null;
        }
        return require(table, key, field);
    }
}
