package com.musclemap.admin;

import com.musclemap.admin.dto.AdminMetricsResponse;
import com.musclemap.admin.dto.AdminUserResponse;
import com.musclemap.user.Role;

import java.util.List;
import java.util.UUID;

/**
 * Platform-management operations (EM9), available only to ADMIN principals
 * (enforced by {@code /admin/**} in {@link com.musclemap.config.SecurityConfig}).
 *
 * <p>Mutating operations take the acting admin's id so the service can refuse a
 * self-lockout (an admin demoting or disabling their own account), which would
 * otherwise leave the platform unmanageable.</p>
 */
public interface AdminService {

    /** Aggregate platform metrics for the admin dashboard. */
    AdminMetricsResponse metrics();

    /** Full user roster, newest accounts first. */
    List<AdminUserResponse> listUsers();

    /**
     * Changes a user's authorization role.
     *
     * @throws IllegalArgumentException if an admin tries to drop their own ADMIN role
     * @throws com.musclemap.common.exception.ResourceNotFoundException if no such user
     */
    AdminUserResponse updateRole(UUID actingAdminId, UUID userId, Role role);

    /**
     * Enables or disables a user account (a disabled user cannot sign in).
     *
     * @throws IllegalArgumentException if an admin tries to disable their own account
     * @throws com.musclemap.common.exception.ResourceNotFoundException if no such user
     */
    AdminUserResponse updateStatus(UUID actingAdminId, UUID userId, boolean enabled);
}
