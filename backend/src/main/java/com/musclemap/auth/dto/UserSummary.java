package com.musclemap.auth.dto;

import com.musclemap.user.AuthProvider;
import com.musclemap.user.Role;
import com.musclemap.user.User;

import java.util.UUID;

/** Public, non-sensitive view of a user (never carries the password hash). */
public record UserSummary(
        UUID id,
        String email,
        String displayName,
        String avatarUrl,
        Role role,
        AuthProvider authProvider,
        boolean emailVerified) {

    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getAuthProvider(),
                user.isEmailVerified());
    }
}
