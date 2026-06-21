package com.musclemap.catalog.dto;

import com.musclemap.catalog.MuscleRole;

import java.math.BigDecimal;

/** A muscle an exercise trains, with its role and volume contribution (0..1). */
public record MuscleInvolvementResponse(String muscleId, MuscleRole role, BigDecimal contribution) {
}
