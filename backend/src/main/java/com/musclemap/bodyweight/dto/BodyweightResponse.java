package com.musclemap.bodyweight.dto;

import com.musclemap.bodyweight.BodyweightEntry;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Public view of a bodyweight weigh-in (EM7); feeds the analytics trend chart. */
public record BodyweightResponse(
        UUID id,
        BigDecimal weightKg,
        LocalDate recordedOn,
        String note,
        Instant createdAt) {

    public static BodyweightResponse from(BodyweightEntry entry) {
        return new BodyweightResponse(
                entry.getId(),
                entry.getWeightKg(),
                entry.getRecordedOn(),
                entry.getNote(),
                entry.getCreatedAt());
    }
}
