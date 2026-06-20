package com.musclemap.coach;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.coach.dto.CoachVideoRequest;
import com.musclemap.coach.dto.CoachVideoResponse;
import com.musclemap.coach.dto.PublishRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Coach Studio endpoints (EM10). The whole controller sits behind
 * {@code /coach/**} → {@code hasAnyRole("COACH","ADMIN")} in
 * {@link com.musclemap.config.SecurityConfig}, so reaching any method already
 * implies an authenticated coach; every operation is additionally scoped to the
 * caller's own content via the verified principal id.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/coach/videos")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Coach", description = "Author, publish and manage your own coach content (COACH or ADMIN)")
public class CoachController {

    private final CoachService coachService;

    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a content item (starts as an unpublished draft)")
    public CoachVideoResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                     @Valid @RequestBody CoachVideoRequest request) {
        return coachService.create(principal.id(), request);
    }

    @GetMapping
    @Operation(summary = "List your own content library (drafts + published), newest first")
    public List<CoachVideoResponse> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return coachService.listForCoach(principal.id());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update one of your own content items")
    public CoachVideoResponse update(@AuthenticationPrincipal AuthenticatedUser principal,
                                     @PathVariable UUID id,
                                     @Valid @RequestBody CoachVideoRequest request) {
        return coachService.update(principal.id(), id, request);
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish or unpublish one of your own content items")
    public CoachVideoResponse setPublished(@AuthenticationPrincipal AuthenticatedUser principal,
                                           @PathVariable UUID id,
                                           @Valid @RequestBody PublishRequest request) {
        return coachService.setPublished(principal.id(), id, request.published());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete one of your own content items")
    public void delete(@AuthenticationPrincipal AuthenticatedUser principal,
                       @PathVariable UUID id) {
        coachService.delete(principal.id(), id);
    }
}
