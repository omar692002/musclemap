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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Default {@link AdminService}. Read paths are transactional read-only; the two
 * mutating paths guard against an admin locking themselves out (see the contract)
 * before delegating the change to the managed {@link User} entity.
 */
@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final GeneratedProgramRepository programRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final CoachVideoRepository coachVideoRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            UserProfileRepository profileRepository,
                            GeneratedProgramRepository programRepository,
                            WorkoutSessionRepository sessionRepository,
                            CoachVideoRepository coachVideoRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.programRepository = programRepository;
        this.sessionRepository = sessionRepository;
        this.coachVideoRepository = coachVideoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminMetricsResponse metrics() {
        // Preserve enum declaration order so the dashboard reads USER → COACH → ADMIN.
        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            usersByRole.put(role.name(), userRepository.countByRole(role));
        }
        return new AdminMetricsResponse(
                userRepository.count(),
                usersByRole,
                userRepository.countByEnabledTrue(),
                userRepository.countByAuthProvider(AuthProvider.LOCAL),
                userRepository.countByAuthProvider(AuthProvider.GOOGLE),
                profileRepository.count(),
                programRepository.count(),
                sessionRepository.count(),
                sessionRepository.countByStatus(SessionStatus.COMPLETED),
                coachVideoRepository.count(),
                coachVideoRepository.countByPublishedTrue());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse updateRole(UUID actingAdminId, UUID userId, Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role must not be null");
        }
        User user = getUser(userId);
        // Guard against the last admin demoting themselves into a lockout.
        if (user.getId().equals(actingAdminId) && role != Role.ADMIN) {
            throw new IllegalArgumentException("You cannot remove your own admin role");
        }
        user.setRole(role);
        return AdminUserResponse.from(user); // managed entity; flushed on commit
    }

    @Override
    @Transactional
    public AdminUserResponse updateStatus(UUID actingAdminId, UUID userId, boolean enabled) {
        User user = getUser(userId);
        if (user.getId().equals(actingAdminId) && !enabled) {
            throw new IllegalArgumentException("You cannot disable your own account");
        }
        user.setEnabled(enabled);
        return AdminUserResponse.from(user); // managed entity; flushed on commit
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }
}
