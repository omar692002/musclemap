package com.musclemap.catalog;

import com.musclemap.catalog.dto.ExerciseResponse;
import com.musclemap.catalog.dto.MuscleResponse;

import java.util.List;

/** Read access to the exercise + muscle catalogue (reference data). */
public interface CatalogService {

    List<ExerciseResponse> listExercises();

    ExerciseResponse getExercise(String id);

    List<MuscleResponse> listMuscles();

    MuscleResponse getMuscle(String id);
}
