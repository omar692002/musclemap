package com.musclemap.catalog;

/**
 * High-level muscle groups (browsing / filtering taxonomy). Mirrors the frontend
 * {@code MuscleGroup} enum value-for-value, so {@code name()} is the wire format
 * the API and the bundled static dataset share.
 */
public enum MuscleGroup {
    CHEST,
    BACK,
    SHOULDERS,
    BICEPS,
    TRICEPS,
    FOREARMS,
    CORE,
    QUADRICEPS,
    HAMSTRINGS,
    GLUTES,
    CALVES,
    NECK,
    ADDUCTORS,
    ABDUCTORS
}
