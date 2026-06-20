package com.musclemap.workout.dto;

import com.musclemap.workout.SessionStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * Payload to persist a tracked workout (EM6). The full runner sends a
 * {@link SessionStatus#COMPLETED} session on finish with its timestamps,
 * duration and the per-exercise sets/reps/weight that were logged. {@code status}
 * defaults to {@link SessionStatus#COMPLETED} when omitted (the common case);
 * timestamps are server-clamped only via validation, not overwritten, so the
 * client's real start/finish times are preserved.
 */
public record WorkoutSessionRequest(
        @Size(max = 160) String name,
        @Size(max = 60) String focus,
        SessionStatus status,
        Instant startedAt,
        Instant completedAt,
        @PositiveOrZero Integer durationSeconds,
        String notes,
        @NotEmpty @Valid List<WorkoutExerciseRequest> exercises) {
}
