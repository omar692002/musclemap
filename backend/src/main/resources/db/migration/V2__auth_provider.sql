-- ===========================================================================
-- MuscleMap - EM2: Authentication & Security
-- Adds OAuth provenance to users so Google sign-in maps onto the same identity
-- model as email/password accounts. password_hash stays nullable (Google users
-- have no local password). Flyway remains the single source of truth.
-- ===========================================================================

ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL'
    CHECK (auth_provider IN ('LOCAL', 'GOOGLE'));
