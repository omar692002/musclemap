package com.musclemap.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Shared identity + audit timestamps for every persistent entity.
 *
 * <p>UUID primary keys are assigned by Hibernate on persist (the DB column also
 * carries a {@code gen_random_uuid()} default for inserts made outside the app).
 * Timestamps are managed by Hibernate, matching the {@code now()} DB defaults.</p>
 */
@MappedSuperclass
@Getter
public abstract class BaseEntity {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public boolean isNew() {
        return id == null;
    }
}
