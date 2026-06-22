package com.musclemap.intel;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.intel.dto.MuscleIntelSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${musclemap.api.base-path}/intel")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Intel", description = "Per-muscle-group fatigue, recovery and volume intelligence")
public class MuscleIntelController {

    private final MuscleIntelService intelService;

    public MuscleIntelController(MuscleIntelService intelService) {
        this.intelService = intelService;
    }

    @GetMapping
    @Operation(summary = "Compute muscle-group intelligence for the current user")
    public MuscleIntelSummaryResponse get(@AuthenticationPrincipal AuthenticatedUser principal) {
        return intelService.compute(principal.id());
    }
}
