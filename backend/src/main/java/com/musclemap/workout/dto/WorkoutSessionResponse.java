package com.musclemap.workout.dto;

import com.musclemap.workout.SessionStatus;
import com.musclemap.workout.WorkoutSession;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Public view of a tracked workout (EM6). Feeds both the session-review screen
 * and the dashboard's streak / weekly-activity / recent summary, which the
 * client computes from the user's completed sessions.
 */
public record WorkoutSessionResponse(
        UUID id,
        String name,
        String focus,
        SessionStatus status,
        Instant startedAt,
        Instant completedAt,
        Integer durationSeconds,
        String notes,
        Instant createdAt,
        List<WorkoutExerciseResponse> exercises) {

    public static WorkoutSessionResponse from(WorkoutSession session) {
        return new WorkoutSessionResponse(
                session.getId(),
                session.getName(),
                session.getFocus(),
                session.getStatus(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getDurationSeconds(),
                session.getNotes(),
                session.getCreatedAt(),
                session.getExercises().stream().map(WorkoutExerciseResponse::from).toList());
    }
}
