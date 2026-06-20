package com.musclemap.workout;

import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import com.musclemap.workout.dto.WorkoutExerciseRequest;
import com.musclemap.workout.dto.WorkoutSessionRequest;
import com.musclemap.workout.dto.WorkoutSessionResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link WorkoutSessionServiceImpl}. Repositories mocked; no DB. */
@ExtendWith(MockitoExtension.class)
class WorkoutSessionServiceImplTest {

    @Mock
    private WorkoutSessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WorkoutSessionServiceImpl service;

    @Captor
    private ArgumentCaptor<WorkoutSession> sessionCaptor;

    private static WorkoutSessionRequest completedRequest() {
        return new WorkoutSessionRequest(
                "Chest & Triceps", "CHEST_TRICEPS", SessionStatus.COMPLETED,
                Instant.parse("2026-06-20T10:00:00Z"), Instant.parse("2026-06-20T10:45:00Z"),
                2700, null,
                List.of(
                        new WorkoutExerciseRequest("Barbell_Bench_Press", "Barbell Bench Press",
                                null, 3, 10, new BigDecimal("60.00"), null, true),
                        new WorkoutExerciseRequest("Triceps_Pushdown", "Triceps Pushdown",
                                null, 3, 12, new BigDecimal("25.00"), null, false)));
    }

    @Test
    void create_persistsSessionWithUserAndOrderedExercises() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setEmail("ada@example.com");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.save(any(WorkoutSession.class))).thenAnswer(inv -> inv.getArgument(0));

        WorkoutSessionResponse response = service.create(userId, completedRequest());

        verify(sessionRepository).save(sessionCaptor.capture());
        WorkoutSession saved = sessionCaptor.getValue();
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(saved.getDurationSeconds()).isEqualTo(2700);
        // Positions are assigned from list order when omitted.
        assertThat(saved.getExercises()).extracting(WorkoutExercise::getPosition).containsExactly(0, 1);
        assertThat(saved.getExercises()).extracting(WorkoutExercise::isCompleted).containsExactly(true, false);
        assertThat(response.exercises()).hasSize(2);
        assertThat(response.exercises().get(0).exerciseRef()).isEqualTo("Barbell_Bench_Press");
    }

    @Test
    void create_defaultsStatusToCompletedWhenOmitted() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(sessionRepository.save(any(WorkoutSession.class))).thenAnswer(inv -> inv.getArgument(0));

        WorkoutSessionRequest noStatus = new WorkoutSessionRequest(
                "Legs", "LEGS", null, null, null, null, null,
                List.of(new WorkoutExerciseRequest("Barbell_Squat", "Barbell Squat",
                        null, 3, 8, new BigDecimal("80.00"), null, true)));

        service.create(userId, noStatus);

        verify(sessionRepository).save(sessionCaptor.capture());
        assertThat(sessionCaptor.getValue().getStatus()).isEqualTo(SessionStatus.COMPLETED);
    }

    @Test
    void create_throwsWhenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(userId, completedRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void getForUser_returnsOwnedSession() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(sessionOwnedBy(userId)));

        WorkoutSessionResponse response = service.getForUser(userId, sessionId);

        assertThat(response).isNotNull();
    }

    @Test
    void getForUser_throwsWhenSessionBelongsToAnotherUser() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(sessionOwnedBy(UUID.randomUUID())));

        assertThatThrownBy(() -> service.getForUser(userId, sessionId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteForUser_throwsWhenSessionMissing() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteForUser(userId, sessionId))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(sessionRepository, never()).delete(any());
    }

    /** A persisted-looking session whose owner has the given id (id stubbed via a spy User). */
    private static WorkoutSession sessionOwnedBy(UUID ownerId) {
        User owner = new User() {
            @Override
            public UUID getId() {
                return ownerId;
            }
        };
        WorkoutSession session = new WorkoutSession();
        session.setUser(owner);
        return session;
    }
}
