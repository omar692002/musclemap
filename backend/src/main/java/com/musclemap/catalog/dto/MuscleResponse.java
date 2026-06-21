package com.musclemap.catalog.dto;

import com.musclemap.catalog.MuscleGroup;

/**
 * One muscle in the taxonomy, shaped to match the frontend {@code Muscle} domain
 * model so the API and the static fallback are interchangeable.
 */
public record MuscleResponse(String id, String name, MuscleGroup group) {
}
