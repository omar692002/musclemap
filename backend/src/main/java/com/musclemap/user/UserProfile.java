package com.musclemap.user;

import com.musclemap.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Onboarding / personalization data captured in M3 and consumed by the
 * program generator (M5) and dashboard (M4). 1:1 with {@link User}.
 */
@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
public class UserProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "age")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "height_cm", precision = 5, scale = 1)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 1)
    private BigDecimal weightKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "fitness_level", length = 20)
    private FitnessLevel fitnessLevel;

    @Column(name = "training_experience", length = 40)
    private String trainingExperience;

    @Enumerated(EnumType.STRING)
    @Column(name = "training_goal", length = 30)
    private TrainingGoal trainingGoal;

    @Column(name = "weekly_frequency")
    private Integer weeklyFrequency;

    /** JSON-encoded list of equipment ids (kept as text; serialized by the service layer). */
    @Column(name = "available_equipment", columnDefinition = "text")
    private String availableEquipment;

    @Column(name = "injury_limitations", columnDefinition = "text")
    private String injuryLimitations;

    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted = false;

    @Column(name = "onboarding_skipped", nullable = false)
    private boolean onboardingSkipped = false;
}
