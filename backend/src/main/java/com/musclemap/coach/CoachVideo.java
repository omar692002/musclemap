package com.musclemap.coach;

import com.musclemap.common.domain.BaseEntity;
import com.musclemap.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Original coach-authored content (the platform's copyright-clean moat).
 * Upload/publish flows arrive in M10; premium gating in M11.
 */
@Entity
@Table(name = "coach_videos")
@Getter
@Setter
@NoArgsConstructor
public class CoachVideo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_id", nullable = false)
    private User coach;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 20)
    private CoachContentType contentType = CoachContentType.TECHNIQUE;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "exercise_ref", length = 160)
    private String exerciseRef;

    @Column(name = "muscle_group", length = 40)
    private String muscleGroup;

    @Column(name = "premium", nullable = false)
    private boolean premium = false;

    @Column(name = "published", nullable = false)
    private boolean published = false;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}
