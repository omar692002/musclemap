package com.musclemap.coach.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Body of the publish toggle (EM10). A tiny dedicated payload keeps the intent
 * explicit (vs. a bare query param) and validated.
 */
public record PublishRequest(@NotNull Boolean published) {
}
