package com.musclemap.bodyweight;

import com.musclemap.common.domain.BaseEntity;
import com.musclemap.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * A single bodyweight weigh-in (EM7). At most one per user per day (DB unique
 * constraint); same-day logs replace the value via the service's upsert, so the
 * analytics screen charts a clean daily bodyweight series.
 */
@Entity
@Table(name = "bodyweight_entries")
@Getter
@Setter
@NoArgsConstructor
public class BodyweightEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "weight_kg", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "recorded_on", nullable = false)
    private LocalDate recordedOn;

    @Column(name = "note", length = 200)
    private String note;
}
