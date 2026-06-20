package com.musclemap.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/** Persistence gateway for {@link Subscription}. */
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByUserIdAndStatus(UUID userId, SubscriptionStatus status);

    /** The user's single subscription row (EM11 keeps at most one per user). */
    Optional<Subscription> findByUserId(UUID userId);

    long countByPlan(SubscriptionPlan plan);
}
