package com.musclemap.coach.dto;

import com.musclemap.coach.CoachContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Payload to create or update a coach content item (EM10). The Studio sends this
 * from the upload/edit form. {@code published} is intentionally NOT here — a
 * separate publish toggle controls visibility, so saving an edit never silently
 * publishes a draft. {@code contentType} defaults to {@link CoachContentType#TECHNIQUE}
 * server-side when omitted.
 */
public record CoachVideoRequest(
        CoachContentType contentType,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String description,
        @Size(max = 500) String videoUrl,
        @Size(max = 500) String thumbnailUrl,
        @Size(max = 160) String exerciseRef,
        @Size(max = 40) String muscleGroup,
        boolean premium,
        @PositiveOrZero Integer durationSeconds) {
}
