package com.musclemap.coach;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Persistence gateway for {@link CoachVideo}. */
public interface CoachVideoRepository extends JpaRepository<CoachVideo, UUID> {

    List<CoachVideo> findByCoachIdOrderByCreatedAtDesc(UUID coachId);

    List<CoachVideo> findByPublishedTrueOrderByCreatedAtDesc();

    /** Published-content count (EM9 admin metrics). */
    long countByPublishedTrue();
}
