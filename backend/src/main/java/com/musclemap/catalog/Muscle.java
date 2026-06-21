package com.musclemap.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single muscle in the taxonomy. The {@code id} is the frontend's stable
 * kebab-case identifier (e.g. {@code pectoralis-major}), so muscle references in
 * exercises, the URL filters and the 3D map stay interchangeable with the
 * formerly-bundled static dataset.
 */
@Entity
@Table(name = "muscles")
@Getter
@Setter
@NoArgsConstructor
public class Muscle {

    @Id
    @Column(name = "id", length = 60, nullable = false, updatable = false)
    private String id;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", nullable = false, length = 20)
    private MuscleGroup group;

    public Muscle(String id, String name, MuscleGroup group) {
        this.id = id;
        this.name = name;
        this.group = group;
    }
}
