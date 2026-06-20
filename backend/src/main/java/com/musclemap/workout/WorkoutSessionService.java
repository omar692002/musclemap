package com.musclemap.workout;

import com.musclemap.workout.dto.WorkoutSessionRequest;
import com.musclemap.workout.dto.WorkoutSessionResponse;

import java.util.List;
import java.util.UUID;

/**
 * Workout tracking (EM6): persist, list, review and delete a user's tracked
 * sessions. Every operation is scoped to the current user (id from the verified
 * JWT principal), so a user can only ever touch their own workouts.
 */
public interface WorkoutSessionService {

    /** Persists a tracked workout (typically a just-completed session) for the user. */
    WorkoutSessionResponse create(UUID userId, WorkoutSessionRequest request);

    /** The user's sessions, newest first. */
    List<WorkoutSessionResponse> listForUser(UUID userId);

    /** A single session the user owns (404 otherwise). */
    WorkoutSessionResponse getForUser(UUID userId, UUID sessionId);

    /** Deletes a session the user owns (404 otherwise). */
    void deleteForUser(UUID userId, UUID sessionId);
}
