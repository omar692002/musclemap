package com.musclemap.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/** Persistence gateway for {@link WorkoutExercise}. */
public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, UUID> {

    List<WorkoutExercise> findBySessionIdOrderByPositionAsc(UUID sessionId);
}
