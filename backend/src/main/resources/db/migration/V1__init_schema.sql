-- ===========================================================================
-- MuscleMap - Milestone 1: foundational schema
-- Flyway is the single source of truth for the database schema.
-- All enum-like columns are stored as VARCHAR guarded by CHECK constraints so
-- the application enum (e.g. com.musclemap.user.Role) and the DB stay in sync
-- without a Postgres ENUM type migration cost.
-- ===========================================================================

-- gen_random_uuid() ships in core Postgres 13+; pgcrypto kept for portability.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- users : identity + authorization role (auth credentials filled in M2)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255),
    role           VARCHAR(20)  NOT NULL DEFAULT 'USER'
                       CHECK (role IN ('USER', 'COACH', 'ADMIN')),
    display_name   VARCHAR(120),
    enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users (role);

-- ---------------------------------------------------------------------------
-- user_profiles : onboarding / personalization data (1:1 with users)
-- ---------------------------------------------------------------------------
CREATE TABLE user_profiles (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL UNIQUE
                             REFERENCES users (id) ON DELETE CASCADE,
    age                  INTEGER     CHECK (age IS NULL OR (age BETWEEN 10 AND 120)),
    gender               VARCHAR(20)
                             CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED')),
    height_cm            NUMERIC(5,1),
    weight_kg            NUMERIC(5,1),
    fitness_level        VARCHAR(20)
                             CHECK (fitness_level IS NULL OR fitness_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    training_experience  VARCHAR(40),
    training_goal        VARCHAR(30)
                             CHECK (training_goal IS NULL OR training_goal IN
                                 ('BUILD_MUSCLE', 'LOSE_FAT', 'GAIN_STRENGTH', 'IMPROVE_ENDURANCE', 'GENERAL_FITNESS')),
    weekly_frequency     INTEGER     CHECK (weekly_frequency IS NULL OR (weekly_frequency BETWEEN 1 AND 7)),
    -- JSON-encoded list of Equipment enum values (kept as text: Flyway-friendly, validate-friendly).
    available_equipment  TEXT,
    injury_limitations   TEXT,
    onboarding_completed BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- generated_programs : a generated multi-day routine for a user
-- ---------------------------------------------------------------------------
CREATE TABLE generated_programs (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name          VARCHAR(160) NOT NULL,
    split_type    VARCHAR(30)  NOT NULL
                      CHECK (split_type IN ('FULL_BODY', 'UPPER_LOWER', 'PUSH_PULL_LEGS', 'BRO_SPLIT', 'BODY_PART')),
    days_per_week INTEGER      NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
    goal          VARCHAR(30)
                      CHECK (goal IS NULL OR goal IN
                          ('BUILD_MUSCLE', 'LOSE_FAT', 'GAIN_STRENGTH', 'IMPROVE_ENDURANCE', 'GENERAL_FITNESS')),
    -- JSON snapshots: input params (seed/equipment) and the generated week payload.
    parameters    TEXT,
    payload       TEXT,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_generated_programs_user ON generated_programs (user_id);

-- ---------------------------------------------------------------------------
-- workout_sessions : a single trackable workout (planned or completed)
-- ---------------------------------------------------------------------------
CREATE TABLE workout_sessions (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    program_id       UUID         REFERENCES generated_programs (id) ON DELETE SET NULL,
    name             VARCHAR(160),
    focus            VARCHAR(60),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PLANNED'
                         CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    duration_seconds INTEGER,
    notes            TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_workout_sessions_user ON workout_sessions (user_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions (status);

-- ---------------------------------------------------------------------------
-- workout_exercises : exercises performed within a session
-- exercise_ref points at the frontend's static dataset id (free-exercise-db).
-- ---------------------------------------------------------------------------
CREATE TABLE workout_exercises (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID         NOT NULL REFERENCES workout_sessions (id) ON DELETE CASCADE,
    exercise_ref  VARCHAR(160) NOT NULL,
    exercise_name VARCHAR(200),
    position      INTEGER      NOT NULL DEFAULT 0,
    sets          INTEGER,
    reps          INTEGER,
    weight_kg     NUMERIC(6,2),
    rpe           NUMERIC(3,1),
    completed     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_workout_exercises_session ON workout_exercises (session_id);

-- ---------------------------------------------------------------------------
-- coach_videos : original coach content (the platform's moat)
-- ---------------------------------------------------------------------------
CREATE TABLE coach_videos (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id         UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    video_url        VARCHAR(500),
    thumbnail_url    VARCHAR(500),
    exercise_ref     VARCHAR(160),
    muscle_group     VARCHAR(40),
    premium          BOOLEAN      NOT NULL DEFAULT FALSE,
    published        BOOLEAN      NOT NULL DEFAULT FALSE,
    duration_seconds INTEGER,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_coach_videos_coach ON coach_videos (coach_id);
CREATE INDEX idx_coach_videos_published ON coach_videos (published);

-- ---------------------------------------------------------------------------
-- subscriptions : monetization foundation (Stripe wiring deferred to M11)
-- ---------------------------------------------------------------------------
CREATE TABLE subscriptions (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan                VARCHAR(20)  NOT NULL DEFAULT 'FREE'
                            CHECK (plan IN ('FREE', 'PREMIUM')),
    status              VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE', 'TRIALING', 'CANCELLED', 'EXPIRED')),
    started_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    current_period_end  TIMESTAMPTZ,
    external_ref        VARCHAR(120),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
