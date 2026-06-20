package com.musclemap.subscription.dto;

import com.musclemap.subscription.Subscription;
import com.musclemap.subscription.SubscriptionPlan;
import com.musclemap.subscription.SubscriptionStatus;

import java.time.Instant;

/**
 * Public view of a user's subscription (EM11). {@code premium} is the single
 * boolean the client gates features on, derived server-side from plan + status +
 * period so the UI never re-implements the entitlement rule.
 */
public record SubscriptionResponse(
        SubscriptionPlan plan,
        SubscriptionStatus status,
        boolean premium,
        Instant startedAt,
        Instant currentPeriodEnd) {

    public static SubscriptionResponse from(Subscription subscription, boolean premium) {
        return new SubscriptionResponse(
                subscription.getPlan(),
                subscription.getStatus(),
                premium,
                subscription.getStartedAt(),
                subscription.getCurrentPeriodEnd());
    }
}
