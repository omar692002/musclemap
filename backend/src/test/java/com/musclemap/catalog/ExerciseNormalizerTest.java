package com.musclemap.catalog;

import com.musclemap.user.Equipment;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Unit tests for {@link ExerciseNormalizer} — the source→domain translation. */
class ExerciseNormalizerTest {

    private final CatalogProperties properties = new CatalogProperties(
            "https://cdn.example/exercises/", "https://img.example/vi/", "/thumb.jpg");

    private ExerciseNormalizer normalizer(Map<String, String> videos) {
        return new ExerciseNormalizer(properties, videos);
    }

    private RawExercise raw() {
        return new RawExercise(
                "Barbell_Bench_Press",
                "Barbell Bench Press",
                "push",
                "beginner",
                "compound",
                "barbell",
                List.of("chest"),
                List.of("triceps", "shoulders"),
                List.of("Lie on the bench.", "Press up."),
                "strength",
                List.of("Barbell_Bench_Press/0.jpg", "Barbell_Bench_Press/1.jpg"));
    }

    @Test
    void mapsSourceVocabularyOntoEnums() {
        Exercise exercise = normalizer(Map.of()).normalize(raw());

        assertThat(exercise.getId()).isEqualTo("Barbell_Bench_Press");
        assertThat(exercise.getCategory()).isEqualTo(ExerciseCategory.STRENGTH);
        assertThat(exercise.getLevel()).isEqualTo(ExerciseLevel.BEGINNER);
        assertThat(exercise.getEquipment()).isEqualTo(Equipment.BARBELL);
        assertThat(exercise.getMechanic()).isEqualTo(ExerciseMechanic.COMPOUND);
        assertThat(exercise.getForce()).isEqualTo(ExerciseForce.PUSH);
        assertThat(exercise.getInstructions()).containsExactly("Lie on the bench.", "Press up.");
    }

    @Test
    void derivesInvolvementsPrimaryThenSecondaryWithDefaultContributions() {
        Exercise exercise = normalizer(Map.of()).normalize(raw());

        assertThat(exercise.getMuscles()).hasSize(3);
        MuscleInvolvement primary = exercise.getMuscles().get(0);
        assertThat(primary.getMuscleId()).isEqualTo("pectoralis-major");
        assertThat(primary.getRole()).isEqualTo(MuscleRole.PRIMARY);
        assertThat(primary.getContribution()).isEqualByComparingTo(new BigDecimal("1.00"));

        // chest (primary) then triceps + shoulders (secondary), order preserved.
        assertThat(exercise.getMuscles()).extracting(MuscleInvolvement::getMuscleId)
                .containsExactly("pectoralis-major", "triceps-brachii", "deltoid");
        assertThat(exercise.getMuscles().get(1).getRole()).isEqualTo(MuscleRole.SECONDARY);
        assertThat(exercise.getMuscles().get(1).getContribution())
                .isEqualByComparingTo(new BigDecimal("0.50"));
    }

    @Test
    void prependsCuratedVideoThenResolvesImages() {
        Exercise exercise = normalizer(Map.of("Barbell_Bench_Press", "abc123")).normalize(raw());

        assertThat(exercise.getMedia()).hasSize(3);
        ExerciseMedia video = exercise.getMedia().get(0);
        assertThat(video.getKind()).isEqualTo(MediaKind.VIDEO);
        assertThat(video.getSource()).isEqualTo(MediaSource.YOUTUBE);
        assertThat(video.getUrl()).isEqualTo("abc123");
        assertThat(video.getThumbnailUrl()).isEqualTo("https://img.example/vi/abc123/thumb.jpg");

        ExerciseMedia image = exercise.getMedia().get(1);
        assertThat(image.getKind()).isEqualTo(MediaKind.IMAGE);
        assertThat(image.getSource()).isEqualTo(MediaSource.FILE);
        assertThat(image.getUrl()).isEqualTo("https://cdn.example/exercises/Barbell_Bench_Press/0.jpg");
        assertThat(image.getThumbnailUrl()).isNull();
    }

    @Test
    void leavesOptionalAttributesNullWhenSourceOmitsThem() {
        RawExercise sparse = new RawExercise("X", "X", null, "expert", null, null,
                List.of("abdominals"), List.of(), List.of(), "stretching", List.of());

        Exercise exercise = normalizer(Map.of()).normalize(sparse);

        assertThat(exercise.getEquipment()).isNull();
        assertThat(exercise.getMechanic()).isNull();
        assertThat(exercise.getForce()).isNull();
        assertThat(exercise.getMedia()).isEmpty();
        assertThat(exercise.getMuscles()).extracting(MuscleInvolvement::getMuscleId)
                .containsExactly("rectus-abdominis");
    }

    @Test
    void failsFastOnUnknownSourceValues() {
        RawExercise bad = new RawExercise("X", "X", null, "beginner", null, null,
                List.of("wings"), List.of(), List.of(), "strength", List.of());

        assertThatThrownBy(() -> normalizer(Map.of()).normalize(bad))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("wings");
    }
}
