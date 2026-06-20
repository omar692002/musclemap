package com.musclemap.subscription;

import com.musclemap.subscription.dto.SubscriptionResponse;

import java.util.UUID;

/**
 * Subscription architecture (EM11). FREE/PREMIUM entitlement for the current user.
 * Payment provider wiring (Stripe) is deliberately out of scope: {@link #upgrade}
 * and {@link #cancel} are a mock billing flow, but the entitlement model and the
 * premium guard ({@link #isPremium}) are real and already enforced server-side.
 */
public interface SubscriptionService {

    /** The user's current subscription, lazily provisioning a FREE one on first read. */
    SubscriptionResponse current(UUID userId);

    /** Whether the user is entitled to premium content right now (the gate). */
    boolean isPremium(UUID userId);

    /** Mock-upgrade the user to PREMIUM (no payment); returns the new state. */
    SubscriptionResponse upgrade(UUID userId);

    /** Cancel back to FREE; returns the new state. */
    SubscriptionResponse cancel(UUID userId);
}
