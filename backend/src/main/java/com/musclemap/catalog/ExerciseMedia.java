package com.musclemap.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One media item (image or video) attached to an {@link Exercise}. For
 * {@code FILE} media the {@code url} is an absolute address; for {@code YOUTUBE}
 * it is the video id. Owned by the exercise aggregate (table {@code exercise_media}).
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ExerciseMedia {

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", length = 10, nullable = false)
    private MediaKind kind;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 10, nullable = false)
    private MediaSource source;

    @Column(name = "url", length = 500, nullable = false)
    private String url;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    public ExerciseMedia(MediaKind kind, MediaSource source, String url, String thumbnailUrl) {
        this.kind = kind;
        this.source = source;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
    }
}
