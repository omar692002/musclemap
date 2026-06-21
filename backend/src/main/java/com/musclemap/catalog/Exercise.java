package com.musclemap.catalog;

import com.musclemap.user.Equipment;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

/**
 * An exercise and the muscles it trains. The {@code id} is the free-exercise-db
 * identifier, preserved so existing references (workout logs, video mapping, URL
 * filters) keep resolving after the migration off the bundled dataset.
 *
 * <p>Instructions, muscle involvements and media are owned child collections
 * ({@code @ElementCollection}), batch-fetched to keep the full-catalogue read
 * (served from an in-memory cache) off the N+1 path.</p>
 */
@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
public class Exercise {

    @Id
    @Column(name = "id", length = 160, nullable = false, updatable = false)
    private String id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private ExerciseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 20)
    private ExerciseLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment", length = 20)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(name = "mechanic", length = 20)
    private ExerciseMechanic mechanic;

    @Enumerated(EnumType.STRING)
    @Column(name = "force", length = 20)
    private ExerciseForce force;

    @ElementCollection
    @CollectionTable(name = "exercise_instructions", joinColumns = @JoinColumn(name = "exercise_id"))
    @OrderColumn(name = "position")
    @Column(name = "instruction", nullable = false)
    @BatchSize(size = 256)
    private List<String> instructions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "exercise_muscles", joinColumns = @JoinColumn(name = "exercise_id"))
    @OrderColumn(name = "position")
    @BatchSize(size = 256)
    private List<MuscleInvolvement> muscles = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "exercise_media", joinColumns = @JoinColumn(name = "exercise_id"))
    @OrderColumn(name = "position")
    @BatchSize(size = 256)
    private List<ExerciseMedia> media = new ArrayList<>();
}
