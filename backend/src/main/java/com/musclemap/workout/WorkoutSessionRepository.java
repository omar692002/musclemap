package com.musclemap.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Persistence gateway for {@link WorkoutSession}. */
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {

    List<WorkoutSession> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<WorkoutSession> findByUserIdAndStatus(UUID userId, SessionStatus status);

    long countByUserIdAndStatus(UUID userId, SessionStatus status);

    /** Platform-wide count by lifecycle state (EM9 admin metrics). */
    long countByStatus(SessionStatus status);
}
