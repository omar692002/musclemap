package com.musclemap.user;

/**
 * Authorization role. Persisted as its name() (see users.role CHECK constraint).
 * Enforced by Spring Security in M2.
 */
public enum Role {
    /** Standard end user: train, track, analyze. */
    USER,
    /** Content creator: upload videos, publish programs/premium content. */
    COACH,
    /** Full platform management. */
    ADMIN
}
