package com.musclemap.coach.dto;

import com.musclemap.coach.CoachContentType;
import com.musclemap.coach.CoachVideo;

import java.time.Instant;
import java.util.UUID;

/**
 * Public view of a coach content item (EM10). Carries the authoring coach's id
 * and display name so the consumer library can credit the creator without a
 * second lookup, but never anything sensitive about that coach's account.
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
        boolean published,
        Integer durationSeconds,
        Instant createdAt,
        Instant updatedAt) {

    public static CoachVideoResponse from(CoachVideo video) {
        return new CoachVideoResponse(
                video.getId(),
                video.getCoach().getId(),
                video.getCoach().getDisplayName(),
                video.getContentType(),
                video.getTitle(),
                video.getDescription(),
                video.getVideoUrl(),
                video.getThumbnailUrl(),
                video.getExerciseRef(),
                video.getMuscleGroup(),
                video.isPremium(),
                video.isPublished(),
                video.getDurationSeconds(),
                video.getCreatedAt(),
                video.getUpdatedAt());
    }
}
