package com.musclemap.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Email/password login payload. */
public record LoginRequest(
        @NotBlank String email,
        @NotBlank String password) {
}
