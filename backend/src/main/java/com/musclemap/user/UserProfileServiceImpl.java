package com.musclemap.user;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.dto.ProfileRequest;
import com.musclemap.user.dto.ProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Default {@link UserProfileService}. The equipment list is stored as a JSON
 * array of {@link Equipment} names in {@code user_profiles.available_equipment}
 * (the column is plain text, kept Flyway-/validation-friendly per the schema).
 * {@code onboardingCompleted} is computed from the data, never trusted from the
 * client.
 */
@Service
public class UserProfileServiceImpl implements UserProfileService {

    private static final TypeReference<List<Equipment>> EQUIPMENT_LIST = new TypeReference<>() {
    };

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public UserProfileServiceImpl(UserProfileRepository profileRepository,
                                  UserRepository userRepository,
                                  ObjectMapper objectMapper) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getForUser(UUID userId) {
        return profileRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElseGet(ProfileResponse::empty);
    }

    @Override
    @Transactional
    public ProfileResponse save(UUID userId, ProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> newProfileFor(userId));

        profile.setAge(request.age());
        profile.setGender(request.gender());
        profile.setHeightCm(request.heightCm());
        profile.setWeightKg(request.weightKg());
        profile.setFitnessLevel(request.fitnessLevel());
        profile.setTrainingExperience(request.trainingExperience());
        profile.setTrainingGoal(request.trainingGoal());
        profile.setWeeklyFrequency(request.weeklyFrequency());
        profile.setAvailableEquipment(serializeEquipment(request.availableEquipment()));
        profile.setInjuryLimitations(request.injuryLimitations());
        profile.setOnboardingCompleted(isComplete(request));

        return toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional
    public ProfileResponse skipOnboarding(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> newProfileFor(userId));
        profile.setOnboardingSkipped(true);
        return toResponse(profileRepository.save(profile));
    }

    private UserProfile newProfileFor(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        return profile;
    }

    /** Onboarding counts as complete once the personalization essentials are present. */
    private static boolean isComplete(ProfileRequest request) {
        return request.age() != null
                && request.gender() != null
                && request.heightCm() != null
                && request.weightKg() != null
                && request.fitnessLevel() != null
                && request.trainingGoal() != null
                && request.weeklyFrequency() != null;
    }

    private String serializeEquipment(List<Equipment> equipment) {
        if (equipment == null || equipment.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(equipment);
        } catch (Exception ex) {
            // Enum list of a fixed vocabulary: serialization cannot realistically fail.
            throw new IllegalStateException("Could not serialize equipment list", ex);
        }
    }

    private List<Equipment> deserializeEquipment(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, EQUIPMENT_LIST);
        } catch (Exception ex) {
            // Defensive: a manually corrupted column should not break the read path.
            return List.of();
        }
    }

    private ProfileResponse toResponse(UserProfile profile) {
        return new ProfileResponse(
                profile.getAge(),
                profile.getGender(),
                profile.getHeightCm(),
                profile.getWeightKg(),
                profile.getFitnessLevel(),
                profile.getTrainingExperience(),
                profile.getTrainingGoal(),
                profile.getWeeklyFrequency(),
                deserializeEquipment(profile.getAvailableEquipment()),
                profile.getInjuryLimitations(),
                profile.isOnboardingCompleted(),
                profile.isOnboardingSkipped());
    }
}
