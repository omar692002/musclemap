package com.musclemap.bodyweight;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Persistence gateway for {@link BodyweightEntry}. */
public interface BodyweightEntryRepository extends JpaRepository<BodyweightEntry, UUID> {

    /** The user's weigh-ins, oldest first — the natural order for a trend chart. */
    List<BodyweightEntry> findByUserIdOrderByRecordedOnAsc(UUID userId);

    /** The existing weigh-in for a given day, if any (drives the upsert). */
    Optional<BodyweightEntry> findByUserIdAndRecordedOn(UUID userId, LocalDate recordedOn);
}
