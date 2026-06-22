package com.musclemap.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musclemap.user.dto.ProfileRequest;
import com.musclemap.user.dto.ProfileResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link UserProfileServiceImpl}. Repositories mocked; no DB. */
@ExtendWith(MockitoExtension.class)
class UserProfileServiceImplTest {

    @Mock
    private UserProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private UserProfileServiceImpl service;

    @Captor
    private ArgumentCaptor<UserProfile> profileCaptor;

    private static ProfileRequest fullRequest() {
        return new ProfileRequest(
                28, Gender.MALE,
                new BigDecimal("180.0"), new BigDecimal("78.5"),
                FitnessLevel.INTERMEDIATE, "2 years",
                TrainingGoal.BUILD_MUSCLE, 4,
                List.of(Equipment.BARBELL, Equipment.DUMBBELL),
                "Left knee");
    }

    @Test
    void save_createsProfileWhenNoneExists_andSerializesEquipment() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setEmail("ada@example.com");
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileResponse response = service.save(userId, fullRequest());

        verify(profileRepository).save(profileCaptor.capture());
        UserProfile saved = profileCaptor.getValue();
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getAge()).isEqualTo(28);
        assertThat(saved.getAvailableEquipment()).isEqualTo("[\"BARBELL\",\"DUMBBELL\"]");
        assertThat(saved.isOnboardingCompleted()).isTrue();
        // Round-trips back through the response.
        assertThat(response.availableEquipment()).containsExactly(Equipment.BARBELL, Equipment.DUMBBELL);
        assertThat(response.onboardingCompleted()).isTrue();
    }

    @Test
    void save_updatesExistingProfileInPlace() {
        UUID userId = UUID.randomUUID();
        UserProfile existing = new UserProfile();
        existing.setUser(new User());
        existing.setAge(20);
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        service.save(userId, fullRequest());

        // Existing row reused (no new User looked up), fields overwritten.
        verify(userRepository, never()).findById(any());
        assertThat(existing.getAge()).isEqualTo(28);
        assertThat(existing.getWeeklyFrequency()).isEqualTo(4);
    }

    @Test
    void save_marksIncompleteWhenCoreFieldsMissing() {
        UUID userId = UUID.randomUUID();
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(new UserProfile()));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileRequest partial = new ProfileRequest(
                28, Gender.MALE, null, null, null, null, null, null, null, null);

        ProfileResponse response = service.save(userId, partial);

        assertThat(response.onboardingCompleted()).isFalse();
        assertThat(response.availableEquipment()).isEmpty();
    }

    @Test
    void save_throwsWhenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.save(userId, fullRequest()))
                .isInstanceOf(com.musclemap.common.exception.ResourceNotFoundException.class);
    }

    @Test
    void getForUser_returnsEmptyWhenNoProfile() {
        UUID userId = UUID.randomUUID();
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());

        ProfileResponse response = service.getForUser(userId);

        assertThat(response.onboardingCompleted()).isFalse();
        assertThat(response.age()).isNull();
        assertThat(response.availableEquipment()).isEmpty();
    }

    @Test
    void skipOnboarding_setsOnboardingSkippedOnExistingProfile() {
        UUID userId = UUID.randomUUID();
        UserProfile existing = new UserProfile();
        existing.setUser(new User());
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileResponse response = service.skipOnboarding(userId);

        assertThat(existing.isOnboardingSkipped()).isTrue();
        assertThat(response.onboardingSkipped()).isTrue();
        verify(userRepository, never()).findById(any());
    }

    @Test
    void skipOnboarding_createsProfileRowWhenNoneExists() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setEmail("test@example.com");
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileResponse response = service.skipOnboarding(userId);

        verify(profileRepository).save(profileCaptor.capture());
        assertThat(profileCaptor.getValue().isOnboardingSkipped()).isTrue();
        assertThat(response.onboardingSkipped()).isTrue();
    }
}
