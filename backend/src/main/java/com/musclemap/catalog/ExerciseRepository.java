package com.musclemap.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Persistence gateway for the exercise catalogue (string ids). */
public interface ExerciseRepository extends JpaRepository<Exercise, String> {

    List<Exercise> findAllByOrderByNameAsc();
}
