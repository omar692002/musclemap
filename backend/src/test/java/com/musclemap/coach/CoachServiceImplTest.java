package com.musclemap.coach;

import com.musclemap.coach.dto.CoachVideoRequest;
import com.musclemap.coach.dto.CoachVideoResponse;
import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.user.Role;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link CoachServiceImpl}. No database required (repositories mocked). */
@ExtendWith(MockitoExtension.class)
class CoachServiceImplTest {

    @Mock private CoachVideoRepository videoRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private CoachServiceImpl coachService;

    @Test
    void create_savesItemOwnedByCoachAsUnpublishedDraft() {
        UUID coachId = UUID.randomUUID();
        User coach = coach(coachId);
        when(userRepository.findById(coachId)).thenReturn(Optional.of(coach));
        // Echo the saved entity back so the response reflects what was persisted.
        when(videoRepository.save(any(CoachVideo.class))).thenAnswer(inv -> inv.getArgument(0));

        CoachVideoResponse result = coachService.create(coachId, request("Bench press cues", true));

        assertThat(result.title()).isEqualTo("Bench press cues");
        assertThat(result.contentType()).isEqualTo(CoachContentType.EDUCATION);
        assertThat(result.premium()).isTrue();
        // A brand-new item is always a draft, regardless of the request.
        assertThat(result.published()).isFalse();
        assertThat(result.coachId()).isEqualTo(coachId);
    }

    @Test
    void create_defaultsContentTypeWhenOmitted() {
        UUID coachId = UUID.randomUUID();
        when(userRepository.findById(coachId)).thenReturn(Optional.of(coach(coachId)));
        when(videoRepository.save(any(CoachVideo.class))).thenAnswer(inv -> inv.getArgument(0));

        CoachVideoRequest noType = new CoachVideoRequest(
                null, "Untitled", null, null, null, null, null, false, null);

        CoachVideoResponse result = coachService.create(coachId, noType);

        assertThat(result.contentType()).isEqualTo(CoachContentType.TECHNIQUE);
    }

    @Test
    void listForCoach_mapsOnlyTheCoachOwnLibrary() {
        UUID coachId = UUID.randomUUID();
        CoachVideo video = video(UUID.randomUUID(), coach(coachId), false);
        when(videoRepository.findByCoachIdOrderByCreatedAtDesc(coachId)).thenReturn(List.of(video));

        List<CoachVideoResponse> result = coachService.listForCoach(coachId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).coachId()).isEqualTo(coachId);
    }

    @Test
    void update_changesFieldsOfOwnItem() {
        UUID coachId = UUID.randomUUID();
        UUID videoId = UUID.randomUUID();
        CoachVideo video = video(videoId, coach(coachId), false);
        when(videoRepository.findById(videoId)).thenReturn(Optional.of(video));

        CoachVideoResponse result = coachService.update(coachId, videoId, request("Updated title", false));

        assertThat(result.title()).isEqualTo("Updated title");
        assertThat(video.getTitle()).isEqualTo("Updated title");
    }

    @Test
    void update_rejectsAnotherCoachItemAsNotFound() {
        UUID coachId = UUID.randomUUID();
        UUID otherCoachId = UUID.randomUUID();
        UUID videoId = UUID.randomUUID();
        CoachVideo video = video(videoId, coach(otherCoachId), false);
        when(videoRepository.findById(videoId)).thenReturn(Optional.of(video));

        assertThatThrownBy(() -> coachService.update(coachId, videoId, request("x", false)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void setPublished_togglesVisibilityOfOwnItem() {
        UUID coachId = UUID.randomUUID();
        UUID videoId = UUID.randomUUID();
        CoachVideo video = video(videoId, coach(coachId), false);
        when(videoRepository.findById(videoId)).thenReturn(Optional.of(video));

        CoachVideoResponse result = coachService.setPublished(coachId, videoId, true);

        assertThat(result.published()).isTrue();
        assertThat(video.isPublished()).isTrue();
    }

    @Test
    void delete_rejectsAnotherCoachItemAsNotFound() {
        UUID coachId = UUID.randomUUID();
        UUID videoId = UUID.randomUUID();
        CoachVideo video = video(videoId, coach(UUID.randomUUID()), false);
        when(videoRepository.findById(videoId)).thenReturn(Optional.of(video));

        assertThatThrownBy(() -> coachService.delete(coachId, videoId))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(videoRepository, never()).delete(any());
    }

    @Test
    void listPublished_returnsEveryPublishedItemRegardlessOfAuthor() {
        CoachVideo a = video(UUID.randomUUID(), coach(UUID.randomUUID()), true);
        CoachVideo b = video(UUID.randomUUID(), coach(UUID.randomUUID()), true);
        when(videoRepository.findByPublishedTrueOrderByCreatedAtDesc()).thenReturn(List.of(a, b));

        List<CoachVideoResponse> result = coachService.listPublished();

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(CoachVideoResponse::published);
    }

    // --- fixtures -----------------------------------------------------------

    private static CoachVideoRequest request(String title, boolean premium) {
        return new CoachVideoRequest(
                CoachContentType.EDUCATION, title, "desc",
                "https://example.com/v.mp4", "https://example.com/t.jpg",
                "exercise-ref", "Chest", premium, 90);
    }

    private static User coach(UUID id) {
        User user = new User();
        user.setEmail("coach-" + id + "@example.com");
        user.setRole(Role.COACH);
        user.setDisplayName("Coach");
        setId(user, id);
        return user;
    }

    private static CoachVideo video(UUID id, User coach, boolean published) {
        CoachVideo video = new CoachVideo();
        video.setCoach(coach);
        video.setContentType(CoachContentType.TECHNIQUE);
        video.setTitle("Title");
        video.setPublished(published);
        setId(video, id);
        return video;
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
