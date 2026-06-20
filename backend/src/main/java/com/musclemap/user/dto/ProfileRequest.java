package com.musclemap.user.dto;

import com.musclemap.user.Equipment;
import com.musclemap.user.FitnessLevel;
import com.musclemap.user.Gender;
import com.musclemap.user.TrainingGoal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Premium-onboarding payload (EM3). Every field is optional so the wizard can
 * save partial progress; bean validation guards the ranges/enums that are
 * supplied. Enum fields (gender/level/goal/equipment) reject unknown values at
 * bind time. {@code onboardingCompleted} is derived server-side from whether the
 * core fields are present, not trusted from the client.
 */
public record ProfileRequest(
        @Min(10) @Max(120) Integer age,
        Gender gender,
        @DecimalMin("50.0") @DecimalMax("260.0") @Digits(integer = 4, fraction = 1) BigDecimal heightCm,
        @DecimalMin("20.0") @DecimalMax("400.0") @Digits(integer = 4, fraction = 1) BigDecimal weightKg,
        FitnessLevel fitnessLevel,
        @Size(max = 40) String trainingExperience,
        TrainingGoal trainingGoal,
        @Min(1) @Max(7) Integer weeklyFrequency,
        List<Equipment> availableEquipment,
        @Size(max = 2000) String injuryLimitations) {
}
