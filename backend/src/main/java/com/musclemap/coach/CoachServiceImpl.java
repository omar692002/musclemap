package com.musclemap.coach;

import com.musclemap.coach.dto.CoachVideoRequest;
import com.musclemap.coach.dto.CoachVideoResponse;
import com.musclemap.common.exception.ResourceNotFoundException;
import com.musclemap.subscription.PremiumRequiredException;
import com.musclemap.user.User;
import com.musclemap.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Default {@link CoachService}. Authoring paths resolve the owning coach from the
 * verified principal and enforce ownership on every read/mutate by checking the
 * item's coach against the caller (a mismatch is surfaced as a 404, mirroring
 * {@code WorkoutSessionServiceImpl}). The consumer path returns published items
 * regardless of author. New items start unpublished — publishing is a deliberate
 * second step.
 */
@Service
public class CoachServiceImpl implements CoachService {

    private final CoachVideoRepository videoRepository;
    private final UserRepository userRepository;

    public CoachServiceImpl(CoachVideoRepository videoRepository, UserRepository userRepository) {
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public CoachVideoResponse create(UUID coachId, CoachVideoRequest request) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", coachId));

        CoachVideo video = new CoachVideo();
        video.setCoach(coach);
        apply(video, request);
        // New content is a draft until the coach explicitly publishes it.
        video.setPublished(false);
        return CoachVideoResponse.from(videoRepository.save(video));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoachVideoResponse> listForCoach(UUID coachId) {
        return videoRepository.findByCoachIdOrderByCreatedAtDesc(coachId).stream()
                .map(CoachVideoResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CoachVideoResponse update(UUID coachId, UUID videoId, CoachVideoRequest request) {
        CoachVideo video = ownedVideo(coachId, videoId);
        apply(video, request);
        return CoachVideoResponse.from(video); // managed entity; flushed on commit
    }

    @Override
    @Transactional
    public CoachVideoResponse setPublished(UUID coachId, UUID videoId, boolean published) {
        CoachVideo video = ownedVideo(coachId, videoId);
        video.setPublished(published);
        return CoachVideoResponse.from(video); // managed entity; flushed on commit
    }

    @Override
    @Transactional
    public void delete(UUID coachId, UUID videoId) {
        videoRepository.delete(ownedVideo(coachId, videoId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoachVideoResponse> listPublished(boolean viewerIsPremium) {
        return videoRepository.findByPublishedTrueOrderByCreatedAtDesc().stream()
                .map(video -> CoachVideoResponse.forViewer(video, viewerIsPremium))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CoachVideoResponse getPublishedForViewer(UUID videoId, boolean viewerIsPremium) {
        CoachVideo video = videoRepository.findById(videoId)
                .filter(CoachVideo::isPublished)
                // An unpublished/missing item is indistinguishable to a consumer.
                .orElseThrow(() -> ResourceNotFoundException.of("CoachVideo", videoId));
        if (video.isPremium() && !viewerIsPremium) {
            throw PremiumRequiredException.forContent();
        }
        return CoachVideoResponse.forViewer(video, viewerIsPremium);
    }

    /** Loads an item and verifies the caller authored it; 404 otherwise. */
    private CoachVideo ownedVideo(UUID coachId, UUID videoId) {
        CoachVideo video = videoRepository.findById(videoId)
                .orElseThrow(() -> ResourceNotFoundException.of("CoachVideo", videoId));
        if (!video.getCoach().getId().equals(coachId)) {
            // Don't reveal that the id exists for another coach.
            throw ResourceNotFoundException.of("CoachVideo", videoId);
        }
        return video;
    }

    /** Copies the editable fields from the request onto the entity. */
    private void apply(CoachVideo video, CoachVideoRequest request) {
        video.setContentType(request.contentType() != null ? request.contentType() : CoachContentType.TECHNIQUE);
        video.setTitle(request.title());
        video.setDescription(request.description());
        video.setVideoUrl(request.videoUrl());
        video.setThumbnailUrl(request.thumbnailUrl());
        video.setExerciseRef(request.exerciseRef());
        video.setMuscleGroup(request.muscleGroup());
        video.setPremium(request.premium());
        video.setDurationSeconds(request.durationSeconds());
    }
}
