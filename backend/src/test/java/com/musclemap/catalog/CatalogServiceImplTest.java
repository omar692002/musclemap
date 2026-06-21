package com.musclemap.catalog;

import com.musclemap.catalog.dto.ExerciseResponse;
import com.musclemap.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link CatalogServiceImpl} (repositories mocked, no database). */
@ExtendWith(MockitoExtension.class)
class CatalogServiceImplTest {

    @Mock private ExerciseRepository exerciseRepository;
    @Mock private MuscleRepository muscleRepository;

    @InjectMocks private CatalogServiceImpl service;

    private Exercise exercise(String id, String name) {
        Exercise e = new Exercise();
        e.setId(id);
        e.setName(name);
        e.setCategory(ExerciseCategory.STRENGTH);
        e.setLevel(ExerciseLevel.BEGINNER);
        e.setInstructions(List.of("step"));
        e.setMuscles(List.of(new MuscleInvolvement("pectoralis-major", MuscleRole.PRIMARY, new BigDecimal("1.00"))));
        e.setMedia(List.of(new ExerciseMedia(MediaKind.IMAGE, MediaSource.FILE, "https://x/img.jpg", null)));
        return e;
    }

    @Test
    void listExercisesMapsAndCachesAfterFirstLoad() {
        when(exerciseRepository.findAllByOrderByNameAsc())
                .thenReturn(List.of(exercise("a", "Alpha"), exercise("b", "Bravo")));

        List<ExerciseResponse> first = service.listExercises();
        List<ExerciseResponse> second = service.listExercises();

        assertThat(first).extracting(ExerciseResponse::id).containsExactly("a", "b");
        assertThat(second).isEqualTo(first);
        // Cached: the repository is hit only once across both reads + a by-id lookup.
        service.getExercise("a");
        verify(exerciseRepository, times(1)).findAllByOrderByNameAsc();
    }

    @Test
    void getExerciseThrowsWhenUnknown() {
        when(exerciseRepository.findAllByOrderByNameAsc()).thenReturn(List.of(exercise("a", "Alpha")));

        assertThatThrownBy(() -> service.getExercise("missing"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void getMuscleThrowsWhenUnknown() {
        when(muscleRepository.findAll())
                .thenReturn(List.of(new Muscle("pectoralis-major", "Pectoralis Major", MuscleGroup.CHEST)));

        assertThat(service.getMuscle("pectoralis-major").name()).isEqualTo("Pectoralis Major");
        assertThatThrownBy(() -> service.getMuscle("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
