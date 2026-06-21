package com.musclemap.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

/** Persistence gateway for the muscle-head taxonomy (string ids). */
public interface MuscleHeadRepository extends JpaRepository<MuscleHead, String> {
}
