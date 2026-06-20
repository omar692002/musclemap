package com.musclemap.admin.dto;

import com.musclemap.user.AuthProvider;
import com.musclemap.user.Role;
import com.musclemap.user.User;

import java.time.Instant;
import java.util.UUID;

/**
 * Administrative view of a user (EM9). Like {@code UserSummary} it never carries
 * the password hash, but it adds the management-relevant fields an admin acts on:
 * {@code enabled} status and the account's creation time.
 */
public record AdminUserResponse(
        UUID id,
        String email,
        String displayName,
        Role role,
        AuthProvider authProvider,
        boolean enabled,
        boolean emailVerified,
        Instant createdAt) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getAuthProvider(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getCreatedAt());
    }
}
