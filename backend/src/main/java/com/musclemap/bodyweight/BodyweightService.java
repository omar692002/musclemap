package com.musclemap.bodyweight;

import com.musclemap.bodyweight.dto.BodyweightRequest;
import com.musclemap.bodyweight.dto.BodyweightResponse;

import java.util.List;
import java.util.UUID;

/**
 * Bodyweight tracking (EM7): log, list and delete a user's weigh-ins. Every
 * operation is scoped to the current user (id from the verified JWT principal),
 * so a user can only ever touch their own bodyweight history.
 */
public interface BodyweightService {

    /** Logs a weigh-in (upserting the user's existing entry for that day). */
    BodyweightResponse log(UUID userId, BodyweightRequest request);

    /** The user's weigh-ins, oldest first (trend-chart order). */
    List<BodyweightResponse> listForUser(UUID userId);

    /** Deletes a weigh-in the user owns (404 otherwise). */
    void deleteForUser(UUID userId, UUID entryId);
}
