package com.musclemap.user.dto;

import com.musclemap.user.Equipment;
import com.musclemap.user.FitnessLevel;
import com.musclemap.user.Gender;
import com.musclemap.user.TrainingGoal;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public view of a user's onboarding profile (EM3). {@code onboardingCompleted}
 * tells the client whether the premium onboarding still needs to run. When no
 * profile row exists yet the controller returns an {@link #empty()} instance so
 * the frontend has a single, null-safe shape to render.
 */
public record ProfileResponse(
        Integer age,
        Gender gender,
        BigDecimal heightCm,
        BigDecimal weightKg,
        FitnessLevel fitnessLevel,
        String trainingExperience,
        TrainingGoal trainingGoal,
        Integer weeklyFrequency,
        List<Equipment> availableEquipment,
        String injuryLimitations,
        boolean onboardingCompleted,
        boolean onboardingSkipped) {

    /** The "no profile yet" response: onboarding has not been completed. */
    public static ProfileResponse empty() {
        return new ProfileResponse(null, null, null, null, null, null, null, null, List.of(), null, false, false);
    }
}
