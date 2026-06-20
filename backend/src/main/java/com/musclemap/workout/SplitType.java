package com.musclemap.workout;

/**
 * Training split for a generated program. Persisted as name()
 * (generated_programs.split_type CHECK constraint). Mirrors the frontend split presets.
 */
public enum SplitType {
    FULL_BODY,
    UPPER_LOWER,
    PUSH_PULL_LEGS,
    BRO_SPLIT,
    BODY_PART
}
