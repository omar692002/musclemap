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

    User getById(UUID id);

    User getByEmail(String email);

    boolean emailExists(String email);
}
