package com.musclemap.auth.dto;

/**
 * Successful authentication result: the platform access token plus the
 * authenticated user's public profile.
 */
public record AuthResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        UserSummary user) {

    public static AuthResponse bearer(String token, long expiresInSeconds, UserSummary user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
