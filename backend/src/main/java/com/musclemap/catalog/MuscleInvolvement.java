package com.musclemap.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Links an {@link Exercise} to one muscle with the role it plays and the volume
 * contribution (0..1) used by the program generator / intel engine. Owned by the
 * exercise aggregate (table {@code exercise_muscles}).
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class MuscleInvolvement {

    @Column(name = "muscle_id", length = 60, nullable = false)
    private String muscleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private MuscleRole role;

    @Column(name = "contribution", precision = 3, scale = 2)
    private BigDecimal contribution;

    public MuscleInvolvement(String muscleId, MuscleRole role, BigDecimal contribution) {
        this.muscleId = muscleId;
        this.role = role;
        this.contribution = contribution;
    }
}
