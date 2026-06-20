package com.musclemap.admin;

import com.musclemap.admin.dto.AdminMetricsResponse;
import com.musclemap.admin.dto.AdminUserResponse;
import com.musclemap.coach.CoachVideoRepository;
import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.AuthProvider;
import com.musclemap.user.Role;
import com.musclemap.user.User;
import com.musclemap.user.UserProfileRepository;
import com.musclemap.user.UserRepository;
import com.musclemap.workout.GeneratedProgramRepository;
import com.musclemap.workout.SessionStatus;
import com.musclemap.workout.WorkoutSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link AdminServiceImpl}. No database required (repositories mocked). */
@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private UserProfileRepository profileRepository;
    @Mock private GeneratedProgramRepository programRepository;
    @Mock private WorkoutSessionRepository sessionRepository;
    @Mock private CoachVideoRepository coachVideoRepository;

    @InjectMocks private AdminServiceImpl adminService;

    @Test
    void metrics_aggregatesCountsAcrossRepositories() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(Role.USER)).thenReturn(7L);
        when(userRepository.countByRole(Role.COACH)).thenReturn(2L);
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);
        when(userRepository.countByEnabledTrue()).thenReturn(9L);
        when(userRepository.countByAuthProvider(AuthProvider.LOCAL)).thenReturn(6L);
        when(userRepository.countByAuthProvider(AuthProvider.GOOGLE)).thenReturn(4L);
        when(profileRepository.count()).thenReturn(8L);
        when(programRepository.count()).thenReturn(12L);
        when(sessionRepository.count()).thenReturn(20L);
        when(sessionRepository.countByStatus(SessionStatus.COMPLETED)).thenReturn(15L);
        when(coachVideoRepository.count()).thenReturn(5L);
        when(coachVideoRepository.countByPublishedTrue()).thenReturn(3L);

        AdminMetricsResponse metrics = adminService.metrics();

        assertThat(metrics.totalUsers()).isEqualTo(10L);
        assertThat(metrics.usersByRole())
                .containsEntry("USER", 7L)
                .containsEntry("COACH", 2L)
                .containsEntry("ADMIN", 1L);
        assertThat(metrics.enabledUsers()).isEqualTo(9L);
        assertThat(metrics.localUsers()).isEqualTo(6L);
        assertThat(metrics.googleUsers()).isEqualTo(4L);
        assertThat(metrics.totalProfiles()).isEqualTo(8L);
        assertThat(metrics.totalPrograms()).isEqualTo(12L);
        assertThat(metrics.totalSessions()).isEqualTo(20L);
        assertThat(metrics.completedSessions()).isEqualTo(15L);
        assertThat(metrics.coachVideos()).isEqualTo(5L);
        assertThat(metrics.publishedVideos()).isEqualTo(3L);
    }

    @Test
    void listUsers_mapsEntitiesToResponsesWithoutSecrets() {
        User user = user(UUID.randomUUID(), "ada@example.com", Role.COACH, true);
        user.setPasswordHash("SECRET-HASH");
        when(userRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(user));

        List<AdminUserResponse> users = adminService.listUsers();

        assertThat(users).hasSize(1);
        AdminUserResponse dto = users.get(0);
        assertThat(dto.email()).isEqualTo("ada@example.com");
        assertThat(dto.role()).isEqualTo(Role.COACH);
        assertThat(dto.enabled()).isTrue();
        // The DTO has no password field at all — secrets never leave the service.
    }

    @Test
    void updateRole_changesRoleOfAnotherUser() {
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        User target = user(targetId, "user@example.com", Role.USER, true);
        when(userRepository.findById(targetId)).thenReturn(Optional.of(target));

        AdminUserResponse result = adminService.updateRole(adminId, targetId, Role.COACH);

        assertThat(result.role()).isEqualTo(Role.COACH);
        assertThat(target.getRole()).isEqualTo(Role.COACH);
    }

    @Test
    void updateRole_rejectsAdminDemotingThemselves() {
        UUID adminId = UUID.randomUUID();
        User self = user(adminId, "admin@example.com", Role.ADMIN, true);
        when(userRepository.findById(adminId)).thenReturn(Optional.of(self));

        assertThatThrownBy(() -> adminService.updateRole(adminId, adminId, Role.USER))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(self.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void updateRole_allowsAdminToReassertOwnAdminRole() {
        UUID adminId = UUID.randomUUID();
        User self = user(adminId, "admin@example.com", Role.ADMIN, true);
        when(userRepository.findById(adminId)).thenReturn(Optional.of(self));

        AdminUserResponse result = adminService.updateRole(adminId, adminId, Role.ADMIN);

        assertThat(result.role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void updateRole_throwsWhenUserMissing() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.updateRole(UUID.randomUUID(), id, Role.USER))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStatus_disablesAnotherUser() {
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        User target = user(targetId, "user@example.com", Role.USER, true);
        when(userRepository.findById(targetId)).thenReturn(Optional.of(target));

        AdminUserResponse result = adminService.updateStatus(adminId, targetId, false);

        assertThat(result.enabled()).isFalse();
        assertThat(target.isEnabled()).isFalse();
    }

    @Test
    void updateStatus_rejectsAdminDisablingThemselves() {
        UUID adminId = UUID.randomUUID();
        User self = user(adminId, "admin@example.com", Role.ADMIN, true);
        when(userRepository.findById(adminId)).thenReturn(Optional.of(self));

        assertThatThrownBy(() -> adminService.updateStatus(adminId, adminId, false))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(self.isEnabled()).isTrue();
        verify(userRepository, never()).save(any());
    }

    /** Builds a User with a forced id (BaseEntity.id is normally Hibernate-assigned). */
    private static User user(UUID id, String email, Role role, boolean enabled) {
        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        user.setEnabled(enabled);
        user.setAuthProvider(AuthProvider.LOCAL);
        setId(user, id);
        return user;
    }

    private static void setId(User user, UUID id) {
        try {
            Field field = Class.forName("com.musclemap.common.domain.BaseEntity").getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Unable to set test id", e);
        }
    }
}
