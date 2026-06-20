package com.musclemap.coach;

import com.musclemap.coach.dto.CoachVideoRequest;
import com.musclemap.coach.dto.CoachVideoResponse;

import java.util.List;
import java.util.UUID;

/**
 * Coach Platform (EM10). The first four operations are the authoring side, scoped
 * to the <em>current</em> coach (a coach only ever sees and mutates their own
 * content; a mismatch is a 404, never leaking another coach's ids). The last
 * operation is the consumer side: the published library any signed-in user reads.
 */
public interface CoachService {

    /** Create a content item owned by the given coach (starts unpublished). */
    CoachVideoResponse create(UUID coachId, CoachVideoRequest request);

    /** The coach's own library (drafts + published), newest first. */
    List<CoachVideoResponse> listForCoach(UUID coachId);

    /** Update one of the coach's own items (visibility is unchanged here). */
    CoachVideoResponse update(UUID coachId, UUID videoId, CoachVideoRequest request);

    /** Publish or unpublish one of the coach's own items. */
    CoachVideoResponse setPublished(UUID coachId, UUID videoId, boolean published);

    /** Delete one of the coach's own items. */
    void delete(UUID coachId, UUID videoId);

    /** The public content library: every published item, newest first. */
    List<CoachVideoResponse> listPublished();
}
