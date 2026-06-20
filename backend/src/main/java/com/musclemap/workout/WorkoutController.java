package com.musclemap.workout;

import com.musclemap.auth.AuthenticatedUser;
import com.musclemap.workout.dto.WorkoutSessionRequest;
import com.musclemap.workout.dto.WorkoutSessionResponse;
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
 * Workout-tracking endpoints (EM6). Every operation acts on the <em>current</em>
 * user (id from the verified JWT principal), so a user can only see and manage
 * their own sessions. The controller sits behind
 * {@code anyRequest().authenticated()} in {@link com.musclemap.config.SecurityConfig}.
 */
@RestController
@RequestMapping("${musclemap.api.base-path}/workouts")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Workouts", description = "Track, review and manage the current user's workout sessions")
public class WorkoutController {

    private final WorkoutSessionService workoutService;

    public WorkoutController(WorkoutSessionService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Persist a tracked workout (e.g. a just-completed session)")
    public WorkoutSessionResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                         @Valid @RequestBody WorkoutSessionRequest request) {
        return workoutService.create(principal.id(), request);
    }

    @GetMapping
    @Operation(summary = "List the current user's workout sessions, newest first")
    public List<WorkoutSessionResponse> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return workoutService.listForUser(principal.id());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one of the current user's workout sessions")
    public WorkoutSessionResponse get(@AuthenticationPrincipal AuthenticatedUser principal,
                                      @PathVariable UUID id) {
        return workoutService.getForUser(principal.id(), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete one of the current user's workout sessions")
    public void delete(@AuthenticationPrincipal AuthenticatedUser principal,
                       @PathVariable UUID id) {
        workoutService.deleteForUser(principal.id(), id);
    }
}
