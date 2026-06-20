package com.musclemap.coach;

import com.musclemap.coach.dto.CoachVideoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The consumer side of the Coach Platform (EM10): the published content library
 * any signed-in user can read. It lives under {@code /content/**} (not
 * {@code /coach/**}), so it is only {@code anyRequest().authenticated()} — no
 * coach role required to watch. Premium items are returned here but flagged
 * {@code premium}; the actual premium gating arrives in EM11.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/content/videos")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Content", description = "Browse published coach content (any signed-in user)")
public class ContentController {

    private final CoachService coachService;

    public ContentController(CoachService coachService) {
        this.coachService = coachService;
    }

    @GetMapping
    @Operation(summary = "List every published coach content item, newest first")
    public List<CoachVideoResponse> list() {
        return coachService.listPublished();
    }
}
