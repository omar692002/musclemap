package com.musclemap.coach;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Persistence gateway for {@link CoachVideo}. */
public interface CoachVideoRepository extends JpaRepository<CoachVideo, UUID> {

    /** A coach's own library (Studio), newest first — published or not. */
    List<CoachVideo> findByCoachIdOrderByCreatedAtDesc(UUID coachId);

    /** The public content library: only published items, newest first. */
    List<CoachVideo> findByPublishedTrueOrderByCreatedAtDesc();

    /** Published-content count (EM9 admin metrics). */
    long countByPublishedTrue();
}
