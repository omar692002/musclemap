package com.musclemap.catalog;

/**
 * Role a muscle plays in an exercise. Mirrors the frontend {@code MuscleRole};
 * drives the default volume contribution applied at seed time.
 */
public enum MuscleRole {
    PRIMARY,
    SECONDARY,
    STABILIZER
}
