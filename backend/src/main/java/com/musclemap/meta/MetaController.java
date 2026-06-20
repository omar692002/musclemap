package com.musclemap.meta;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public metadata endpoint. The path is resolved from {@code musclemap.api.base-path}
 * (default {@code /api/v1}) so the version prefix is configured in one place.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/meta")
@Tag(name = "Meta", description = "Platform metadata and canonical vocabularies")
public class MetaController {

    private final PlatformService platformService;

    public MetaController(PlatformService platformService) {
        this.platformService = platformService;
    }

    @GetMapping
    @Operation(summary = "Describe the platform: version, milestone, roles, goals, splits, plans")
    public PlatformInfoResponse meta() {
        return platformService.describe();
    }
}
