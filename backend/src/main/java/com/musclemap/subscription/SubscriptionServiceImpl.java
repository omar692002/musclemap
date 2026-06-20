package com.musclemap.subscription;

import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.subscription.dto.SubscriptionResponse;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Default {@link SubscriptionService}. Each user has at most one subscription row;
 * it is provisioned lazily as FREE on first access so the table fills naturally
 * without a backfill. {@link #isPremium} is the single source of truth for the
 * premium gate — plan PREMIUM, status ACTIVE/TRIALING, and (if set) the mock
 * billing period not yet elapsed. Upgrade/cancel mutate that row; real payment
 * wiring would only need to set {@code externalRef} and the period end.
 */
@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    /** Length of a mock premium period granted by {@link #upgrade}. */
    private static final Duration PREMIUM_PERIOD = Duration.ofDays(30);

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SubscriptionResponse current(UUID userId) {
        Subscription subscription = resolve(userId);
        return SubscriptionResponse.from(subscription, isActivePremium(subscription));
    }

    @Override
    @Transactional
    public boolean isPremium(UUID userId) {
        return isActivePremium(resolve(userId));
    }

    @Override
    @Transactional
    public SubscriptionResponse upgrade(UUID userId) {
        Subscription subscription = resolve(userId);
        Instant now = Instant.now();
        subscription.setPlan(SubscriptionPlan.PREMIUM);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartedAt(now);
        subscription.setCurrentPeriodEnd(now.plus(PREMIUM_PERIOD));
        // No payment provider yet (EM11 is Stripe-free): externalRef stays null.
        return SubscriptionResponse.from(subscription, isActivePremium(subscription));
    }

    @Override
    @Transactional
    public SubscriptionResponse cancel(UUID userId) {
        Subscription subscription = resolve(userId);
        subscription.setPlan(SubscriptionPlan.FREE);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCurrentPeriodEnd(null);
        subscription.setExternalRef(null);
        return SubscriptionResponse.from(subscription, false);
    }

    /** The user's subscription, creating a FREE one on first access. */
    private Subscription resolve(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> createFree(userId));
    }

    private Subscription createFree(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setPlan(SubscriptionPlan.FREE);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartedAt(Instant.now());
        return subscriptionRepository.save(subscription);
    }

    /** The entitlement rule: PREMIUM, live status, and the period not elapsed. */
    private static boolean isActivePremium(Subscription subscription) {
        if (subscription.getPlan() != SubscriptionPlan.PREMIUM) {
            return false;
        }
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE
                && subscription.getStatus() != SubscriptionStatus.TRIALING) {
            return false;
        }
        Instant periodEnd = subscription.getCurrentPeriodEnd();
        return periodEnd == null || periodEnd.isAfter(Instant.now());
    }
}
