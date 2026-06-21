package com.musclemap.catalog;

import com.musclemap.catalog.dto.ExerciseResponse;
import com.musclemap.catalog.dto.MuscleResponse;
import com.musclemap.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Serves the catalogue from an in-memory cache built lazily on first access. The
 * catalogue is reference data seeded once at boot (see {@link CatalogBootstrap})
 * and never mutated at runtime, so caching the mapped responses keeps the
 * full-catalogue read off the per-request mapping + lazy-loading path.
 *
 * <p>The cache builders are the transactional entry points so the exercises'
 * lazy child collections initialise while a session is open.</p>
 */
@Service
public class CatalogServiceImpl implements CatalogService {

    private final ExerciseRepository exerciseRepository;
    private final MuscleRepository muscleRepository;

    private volatile Map<String, ExerciseResponse> exercises;
    private volatile Map<String, MuscleResponse> muscles;

    public CatalogServiceImpl(ExerciseRepository exerciseRepository, MuscleRepository muscleRepository) {
        this.exerciseRepository = exerciseRepository;
        this.muscleRepository = muscleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseResponse> listExercises() {
        return List.copyOf(exercises().values());
    }

    @Override
    @Transactional(readOnly = true)
    public ExerciseResponse getExercise(String id) {
        ExerciseResponse response = exercises().get(id);
        if (response == null) {
            throw ResourceNotFoundException.of("Exercise", id);
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MuscleResponse> listMuscles() {
        return List.copyOf(muscles().values());
    }

    @Override
    @Transactional(readOnly = true)
    public MuscleResponse getMuscle(String id) {
        MuscleResponse response = muscles().get(id);
        if (response == null) {
            throw ResourceNotFoundException.of("Muscle", id);
        }
        return response;
    }

    private Map<String, ExerciseResponse> exercises() {
        Map<String, ExerciseResponse> cache = exercises;
        if (cache == null) {
            synchronized (this) {
                cache = exercises;
                if (cache == null) {
                    cache = exerciseRepository.findAllByOrderByNameAsc().stream()
                            .map(CatalogMapper::toResponse)
                            .collect(Collectors.toMap(
                                    ExerciseResponse::id, Function.identity(),
                                    (a, b) -> a, LinkedHashMap::new));
                    exercises = cache;
                }
            }
        }
        return cache;
    }

    private Map<String, MuscleResponse> muscles() {
        Map<String, MuscleResponse> cache = muscles;
        if (cache == null) {
            synchronized (this) {
                cache = muscles;
                if (cache == null) {
                    cache = muscleRepository.findAll().stream()
                            .map(CatalogMapper::toResponse)
                            .collect(Collectors.toMap(
                                    MuscleResponse::id, Function.identity(),
                                    (a, b) -> a, LinkedHashMap::new));
                    muscles = cache;
                }
            }
        }
        return cache;
    }
}
