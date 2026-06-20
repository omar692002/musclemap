package com.musclemap.workout;

import com.musclemap.common.domain.BaseEntity;
import com.musclemap.user.TrainingGoal;
import com.musclemap.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A persisted, generated multi-day routine for a user. The {@code payload} holds a
 * JSON snapshot of the generated week so the exact program is reproducible.
 */
@Entity
@Table(name = "generated_programs")
@Getter
@Setter
@NoArgsConstructor
public class GeneratedProgram extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_type", nullable = false, length = 30)
    private SplitType splitType;

    @Column(name = "days_per_week", nullable = false)
    private int daysPerWeek;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal", length = 30)
    private TrainingGoal goal;

    /** JSON snapshot of generation inputs (seed, equipment, ...). */
    @Column(name = "parameters", columnDefinition = "text")
    private String parameters;

    /** JSON snapshot of the generated week. */
    @Column(name = "payload", columnDefinition = "text")
    private String payload;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
