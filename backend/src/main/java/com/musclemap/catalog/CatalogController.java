package com.musclemap.catalog;

import com.musclemap.catalog.dto.ExerciseResponse;
import com.musclemap.catalog.dto.MuscleResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public read API for the exercise + muscle catalogue (EM13). Replaces the
 * formerly client-bundled static dataset; consumed by the frontend's
 * {@code ApiExerciseRepository}/{@code ApiMuscleRepository} behind the same
 * repository interfaces. No auth required — reference data.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/catalog")
@Tag(name = "Catalog", description = "Exercise and muscle taxonomy (public reference data)")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/exercises")
    @Operation(summary = "List the full exercise catalogue")
    public List<ExerciseResponse> listExercises() {
        return catalogService.listExercises();
    }

    @GetMapping("/exercises/{id}")
    @Operation(summary = "Get one exercise by id (404 if unknown)")
    public ExerciseResponse getExercise(@PathVariable String id) {
        return catalogService.getExercise(id);
    }

    @GetMapping("/muscles")
    @Operation(summary = "List the muscle taxonomy")
    public List<MuscleResponse> listMuscles() {
        return catalogService.listMuscles();
    }

    @GetMapping("/muscles/{id}")
    @Operation(summary = "Get one muscle by id (404 if unknown)")
    public MuscleResponse getMuscle(@PathVariable String id) {
        return catalogService.getMuscle(id);
    }
}
