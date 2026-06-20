package com.musclemap.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Google sign-in payload: the {@code credential} is the ID token issued by Google
 * Identity Services on the frontend, exchanged here for a platform JWT.
 */
public record GoogleAuthRequest(
        @NotBlank String credential) {
}
