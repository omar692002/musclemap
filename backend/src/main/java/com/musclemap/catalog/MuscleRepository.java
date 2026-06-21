package com.musclemap.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Persistence gateway for the muscle taxonomy (string ids). */
public interface MuscleRepository extends JpaRepository<Muscle, String> {

    List<Muscle> findByGroup(MuscleGroup group);
}
