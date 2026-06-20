package com.musclemap.subscription;

import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.subscription.dto.SubscriptionResponse;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link SubscriptionServiceImpl}. No database required (repositories mocked). */
@ExtendWith(MockitoExtension.class)
class SubscriptionServiceImplTest {

    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private SubscriptionServiceImpl service;

    @Test
    void current_provisionsAFreeSubscriptionOnFirstAccess() {
        UUID userId = UUID.randomUUID();
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId)));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse result = service.current(userId);

        assertThat(result.plan()).isEqualTo(SubscriptionPlan.FREE);
        assertThat(result.status()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(result.premium()).isFalse();
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void current_failsWhenUserDoesNotExist() {
        UUID userId = UUID.randomUUID();
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.current(userId)).isInstanceOf(ResourceNotFoundException.class);
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void isPremium_trueForActivePremiumWithinPeriod() {
        UUID userId = UUID.randomUUID();
        Subscription sub = subscription(userId, SubscriptionPlan.PREMIUM, SubscriptionStatus.ACTIVE,
                Instant.now().plus(10, ChronoUnit.DAYS));
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(sub));

        assertThat(service.isPremium(userId)).isTrue();
    }

    @Test
    void isPremium_falseForFreePlan() {
        UUID userId = UUID.randomUUID();
        Subscription sub = subscription(userId, SubscriptionPlan.FREE, SubscriptionStatus.ACTIVE, null);
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(sub));

        assertThat(service.isPremium(userId)).isFalse();
    }

    @Test
    void isPremium_falseForExpiredPremiumPeriod() {
        UUID userId = UUID.randomUUID();
        Subscription sub = subscription(userId, SubscriptionPlan.PREMIUM, SubscriptionStatus.ACTIVE,
                Instant.now().minus(1, ChronoUnit.DAYS));
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(sub));

        assertThat(service.isPremium(userId)).isFalse();
    }

    @Test
    void isPremium_falseForCancelledPremium() {
        UUID userId = UUID.randomUUID();
        Subscription sub = subscription(userId, SubscriptionPlan.PREMIUM, SubscriptionStatus.CANCELLED,
                Instant.now().plus(10, ChronoUnit.DAYS));
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(sub));

        assertThat(service.isPremium(userId)).isFalse();
    }

    @Test
    void upgrade_makesTheUserPremiumWithAFuturePeriodEnd() {
        UUID userId = UUID.randomUUID();
        Subscription sub = subscription(userId, SubscriptionPlan.FREE, SubscriptionStatus.ACTIVE, null);
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(sub));

        SubscriptionResponse result = service.upgrade(userId);

        assertThat(result.plan()).isEqualTo(SubscriptionPlan.PREMIUM);
        assertThat(result.premium()).isTrue();
        assertThat(result.currentPeriodEnd()).isAfter(Instant.now());
        // Mock billing: no payment provider reference is set.
        assertThat(sub.getExternalRef()).isNull();
    }

    @Test
    void cancel_returnsTheUserToFree() {
        UUID userId = UUID.randomUUID();
        Subscription sub = subscription(userId, SubscriptionPlan.PREMIUM, SubscriptionStatus.ACTIVE,
                Instant.now().plus(10, ChronoUnit.DAYS));
        sub.setExternalRef("mock-ref");
        when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(sub));

        SubscriptionResponse result = service.cancel(userId);

        assertThat(result.plan()).isEqualTo(SubscriptionPlan.FREE);
        assertThat(result.premium()).isFalse();
        assertThat(result.currentPeriodEnd()).isNull();
        assertThat(sub.getExternalRef()).isNull();
    }

    // --- fixtures -----------------------------------------------------------

    private static User user(UUID id) {
        User user = new User();
        user.setEmail("user-" + id + "@example.com");
        setId(user, id);
        return user;
    }

    private static Subscription subscription(UUID userId, SubscriptionPlan plan,
                                             SubscriptionStatus status, Instant periodEnd) {
        Subscription sub = new Subscription();
        sub.setUser(user(userId));
        sub.setPlan(plan);
        sub.setStatus(status);
        sub.setStartedAt(Instant.now());
        sub.setCurrentPeriodEnd(periodEnd);
        return sub;
    }

    private static void setId(Object entity, UUID id) {
        try {
            Field field = Class.forName("com.musclemap.common.domain.BaseEntity").getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Unable to set test id", e);
        }
    }
}
