package com.musclemap.auth;

import com.musclemap.user.Role;

import java.util.UUID;

/**
 * Lightweight authenticated principal carried in the Spring Security context.
 * Built straight from verified JWT claims (no per-request DB hit); controllers
 * read it via {@code @AuthenticationPrincipal}.
 */
public record AuthenticatedUser(UUID id, String email, Role role) {
}
