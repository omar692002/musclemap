package com.musclemap.user;

import java.util.UUID;

/**
 * Service-layer contract for user identity. The M2 authentication flow
 * (registration/login) builds directly on these operations.
 */
public interface UserService {

    /**
     * Creates a user with a securely hashed password.
     *
     * @throws IllegalArgumentException if the email is already registered
     */
    User register(String email, String rawPassword, String displayName, Role role);

    /**
     * Finds the user with this email or provisions a new one from an external
     * identity provider (e.g. Google). OAuth users have no local password; their
     * email is treated as verified. Display name / avatar are refreshed from the
     * provider on each sign-in when present.
     */
    User findOrCreateOAuthUser(String email, String displayName, String avatarUrl, AuthProvider provider);

    User getById(UUID id);

    User getByEmail(String email);

    boolean emailExists(String email);
}
