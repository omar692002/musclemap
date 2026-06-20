package com.musclemap.user;

/**
 * How a user authenticates. Persisted as its name() (see users.auth_provider
 * CHECK constraint). {@code LOCAL} users sign in with email + password (BCrypt);
 * {@code GOOGLE} users sign in via Google Identity (no local password).
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE
}
