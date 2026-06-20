package com.musclemap.user;

/**
 * Training equipment a user has access to. Mirrors the frontend {@code Equipment}
 * vocabulary; persisted (in {@code user_profiles.available_equipment}) as a
 * JSON array of {@code name()} values, validated against this enum.
 */
public enum Equipment {
    BANDS,
    BARBELL,
    BODYWEIGHT,
    CABLE,
    DUMBBELL,
    EZ_CURL_BAR,
    EXERCISE_BALL,
    FOAM_ROLL,
    KETTLEBELL,
    MACHINE,
    MEDICINE_BALL,
    OTHER
}
