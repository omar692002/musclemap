package com.musclemap.generator;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public read API for the program-generator configuration (EM13, Phase 2): the
 * tuning the client-side generator runs on (splits, goal schemes, weekly layouts,
 * progression). The generation algorithm itself stays in the browser; only its
 * config is served here, consumed dual-path with a bundled fallback. No auth —
 * reference data.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/generator")
@Tag(name = "Generator", description = "Program-generator configuration (public reference data)")
public class GeneratorController {

    private final GeneratorService generatorService;

    public GeneratorController(GeneratorService generatorService) {
        this.generatorService = generatorService;
    }

    @GetMapping("/config")
    @Operation(summary = "Get the program-generator configuration")
    public JsonNode config() {
        return generatorService.config();
    }
}
