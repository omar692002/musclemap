package com.musclemap.coach.dto;

import com.musclemap.coach.CoachContentType;
import com.musclemap.coach.CoachVideo;

import java.time.Instant;
import java.util.UUID;

/**
 * Public view of a coach content item (EM10). Carries the authoring coach's id
 * and display name so the consumer library can credit the creator without a
 * second lookup, but never anything sensitive about that coach's account.
 *
 * <p>{@code locked} (EM11) tells a consumer whether the premium gate is closed
 * for them; when it is, {@link #forViewer} also withholds the {@code videoUrl} so
 * a FREE user can never obtain a premium item's source from the API.</p>
 */
public record CoachVideoResponse(
        UUID id,
        UUID coachId,
        String coachName,
        CoachContentType contentType,
        String title,
        String description,
        String videoUrl,
        String thumbnailUrl,
        String exerciseRef,
        String muscleGroup,
        boolean premium,
        boolean locked,
        boolean published,
        Integer durationSeconds,
        Instant createdAt,
        Instant updatedAt) {

    /** Full view (authoring side / unrestricted): never locked, url always present. */
    public static CoachVideoResponse from(CoachVideo video) {
        return map(video, false);
    }

    /**
     * Consumer view honouring the premium gate: a premium item is locked (and its
     * {@code videoUrl} stripped) unless the viewer is entitled to premium.
     */
    public static CoachVideoResponse forViewer(CoachVideo video, boolean viewerIsPremium) {
        return map(video, video.isPremium() && !viewerIsPremium);
    }

    private static CoachVideoResponse map(CoachVideo video, boolean locked) {
        return new CoachVideoResponse(
                video.getId(),
                video.getCoach().getId(),
                video.getCoach().getDisplayName(),
                video.getContentType(),
                video.getTitle(),
                video.getDescription(),
                locked ? null : video.getVideoUrl(),
                video.getThumbnailUrl(),
                video.getExerciseRef(),
                video.getMuscleGroup(),
                video.isPremium(),
                locked,
                video.isPublished(),
                video.getDurationSeconds(),
                video.getCreatedAt(),
                video.getUpdatedAt());
    }
}
