package com.musclemap.bodyweight;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.bodyweight.dto.BodyweightRequest;
import com.musclemap.bodyweight.dto.BodyweightResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Bodyweight-tracking endpoints (EM7), feeding the analytics screen's bodyweight
 * evolution chart. Every operation acts on the <em>current</em> user (id from the
 * verified JWT principal); the controller sits behind
 * {@code anyRequest().authenticated()} in {@link com.musclemap.config.SecurityConfig}.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/bodyweight")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Bodyweight", description = "Log and review the current user's bodyweight history")
public class BodyweightController {

    private final BodyweightService bodyweightService;

    public BodyweightController(BodyweightService bodyweightService) {
        this.bodyweightService = bodyweightService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Log a weigh-in (replaces an existing same-day entry)")
    public BodyweightResponse log(@AuthenticationPrincipal AuthenticatedUser principal,
                                  @Valid @RequestBody BodyweightRequest request) {
        return bodyweightService.log(principal.id(), request);
    }

    @GetMapping
    @Operation(summary = "List the current user's weigh-ins, oldest first")
    public List<BodyweightResponse> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return bodyweightService.listForUser(principal.id());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete one of the current user's weigh-ins")
    public void delete(@AuthenticationPrincipal AuthenticatedUser principal,
                       @PathVariable UUID id) {
        bodyweightService.deleteForUser(principal.id(), id);
    }
}
