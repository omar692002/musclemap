package com.musclemap.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Persistence gateway for {@link GeneratedProgram}. */
public interface GeneratedProgramRepository extends JpaRepository<GeneratedProgram, UUID> {

    List<GeneratedProgram> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<GeneratedProgram> findByUserIdAndActiveTrue(UUID userId);
}
