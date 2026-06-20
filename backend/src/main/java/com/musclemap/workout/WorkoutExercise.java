package com.musclemap.workout;

import com.musclemap.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * One exercise performed within a {@link WorkoutSession}. {@code exerciseRef} points
 * at the frontend's static dataset id (free-exercise-db), keeping the rich exercise
 * catalogue on the client while the backend tracks what was actually done.
 */
@Entity
@Table(name = "workout_exercises")
@Getter
@Setter
@NoArgsConstructor
public class WorkoutExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private WorkoutSession session;

    @Column(name = "exercise_ref", nullable = false, length = 160)
    private String exerciseRef;

    @Column(name = "exercise_name", length = 200)
    private String exerciseName;

    @Column(name = "position", nullable = false)
    private int position = 0;

    @Column(name = "sets")
    private Integer sets;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "rpe", precision = 3, scale = 1)
    private BigDecimal rpe;

    @Column(name = "completed", nullable = false)
    private boolean completed = false;
}
