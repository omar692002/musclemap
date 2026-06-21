package com.musclemap.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A trainable head/region of a parent {@link Muscle} (e.g. the three deltoid
 * heads). The parent link is kept as a plain id column to mirror the flat
 * frontend taxonomy and keep serialization trivial.
 */
@Entity
@Table(name = "muscle_heads")
@Getter
@Setter
@NoArgsConstructor
public class MuscleHead {

    @Id
    @Column(name = "id", length = 60, nullable = false, updatable = false)
    private String id;

    @Column(name = "parent_muscle_id", length = 60, nullable = false)
    private String parentMuscleId;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    public MuscleHead(String id, String parentMuscleId, String name) {
        this.id = id;
        this.parentMuscleId = parentMuscleId;
        this.name = name;
    }
}
