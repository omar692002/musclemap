package com.musclemap.bodyweight.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Payload to log a bodyweight weigh-in (EM7). {@code recordedOn} defaults to the
 * server's today when omitted; a second log for the same day replaces the value
 * (the service upserts), keeping the bodyweight series at one point per day.
 */
public record BodyweightRequest(
        @NotNull @DecimalMin("1.0") @DecimalMax("999.99") BigDecimal weightKg,
        LocalDate recordedOn,
        @Size(max = 200) String note) {
}
