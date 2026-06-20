package com.musclemap.user;

import com.musclemap.user.dto.ProfileRequest;
import com.musclemap.user.dto.ProfileResponse;

import java.util.UUID;

/**
 * Service contract for the onboarding profile (EM3). One profile per user
 * (1:1 with {@link User}); {@link #save} performs an upsert.
 */
public interface UserProfileService {

    /** Current profile for the user, or an "empty" (not-onboarded) view if none exists. */
    ProfileResponse getForUser(UUID userId);

    /** Creates or updates the user's profile from the onboarding payload. */
    ProfileResponse save(UUID userId, ProfileRequest request);
}
