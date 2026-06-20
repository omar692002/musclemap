package com.musclemap.bodyweight;

import com.musclemap.bodyweight.dto.BodyweightRequest;
import com.musclemap.bodyweight.dto.BodyweightResponse;
import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link BodyweightServiceImpl}. Repositories mocked; no DB. */
@ExtendWith(MockitoExtension.class)
class BodyweightServiceImplTest {

    @Mock
    private BodyweightEntryRepository entryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BodyweightServiceImpl service;

    @Captor
    private ArgumentCaptor<BodyweightEntry> entryCaptor;

    private static final LocalDate DAY = LocalDate.parse("2026-06-20");

    @Test
    void log_createsNewEntryWhenNoneForThatDay() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setEmail("ada@example.com");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(entryRepository.findByUserIdAndRecordedOn(userId, DAY)).thenReturn(Optional.empty());
        when(entryRepository.save(any(BodyweightEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        BodyweightResponse response = service.log(userId,
                new BodyweightRequest(new BigDecimal("82.50"), DAY, "morning"));

        verify(entryRepository).save(entryCaptor.capture());
        BodyweightEntry saved = entryCaptor.getValue();
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getWeightKg()).isEqualByComparingTo("82.50");
        assertThat(saved.getRecordedOn()).isEqualTo(DAY);
        assertThat(saved.getNote()).isEqualTo("morning");
        assertThat(response.weightKg()).isEqualByComparingTo("82.50");
    }

    @Test
    void log_updatesExistingSameDayEntryInsteadOfStacking() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        BodyweightEntry existing = new BodyweightEntry();
        existing.setRecordedOn(DAY);
        existing.setWeightKg(new BigDecimal("83.00"));
        when(entryRepository.findByUserIdAndRecordedOn(userId, DAY)).thenReturn(Optional.of(existing));
        when(entryRepository.save(any(BodyweightEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        service.log(userId, new BodyweightRequest(new BigDecimal("82.10"), DAY, null));

        verify(entryRepository).save(entryCaptor.capture());
        // The same instance is reused (upsert), with the new value applied.
        assertThat(entryCaptor.getValue()).isSameAs(existing);
        assertThat(existing.getWeightKg()).isEqualByComparingTo("82.10");
    }

    @Test
    void log_defaultsRecordedOnToTodayWhenOmitted() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(entryRepository.findByUserIdAndRecordedOn(eq(userId), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(entryRepository.save(any(BodyweightEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        service.log(userId, new BodyweightRequest(new BigDecimal("80.00"), null, null));

        verify(entryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getRecordedOn()).isEqualTo(LocalDate.now());
    }

    @Test
    void log_throwsWhenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.log(userId, new BodyweightRequest(new BigDecimal("80.00"), DAY, null)))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(entryRepository, never()).save(any());
    }

    @Test
    void deleteForUser_throwsWhenEntryBelongsToAnotherUser() {
        UUID userId = UUID.randomUUID();
        UUID entryId = UUID.randomUUID();
        when(entryRepository.findById(entryId)).thenReturn(Optional.of(entryOwnedBy(UUID.randomUUID())));

        assertThatThrownBy(() -> service.deleteForUser(userId, entryId))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(entryRepository, never()).delete(any());
    }

    @Test
    void deleteForUser_throwsWhenEntryMissing() {
        UUID userId = UUID.randomUUID();
        UUID entryId = UUID.randomUUID();
        when(entryRepository.findById(entryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteForUser(userId, entryId))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(entryRepository, never()).delete(any());
    }

    /** An entry whose owner has the given id (id stubbed via an anonymous User). */
    private static BodyweightEntry entryOwnedBy(UUID ownerId) {
        User owner = new User() {
            @Override
            public UUID getId() {
                return ownerId;
            }
        };
        BodyweightEntry entry = new BodyweightEntry();
        entry.setUser(owner);
        return entry;
    }
}
