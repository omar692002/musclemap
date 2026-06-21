-- ===========================================================================
-- MuscleMap - EM13: Catalogue migration (exercises + muscle taxonomy)
-- Moves the formerly client-bundled static catalogue (873 free-exercise-db
-- exercises + the muscle taxonomy/heads) into the database. Seeded idempotently
-- on startup by CatalogBootstrap from the normalised source resources.
--
-- Natural string PKs (not UUIDs): muscle ids are the frontend's kebab ids
-- (e.g. 'pectoralis-major') and exercise ids are the free-exercise-db ids, so
-- the API and the bundled static dataset stay interchangeable behind the same
-- repository interfaces. Enum-like columns follow the project's VARCHAR + CHECK
-- convention, kept in lock-step with the com.musclemap.catalog Java enums.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- muscles : the muscle-level taxonomy (browsing / filtering / involvements)
-- ---------------------------------------------------------------------------
CREATE TABLE muscles (
    id           VARCHAR(60) PRIMARY KEY,
    name         VARCHAR(80) NOT NULL,
    muscle_group VARCHAR(20) NOT NULL
                     CHECK (muscle_group IN (
                         'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS',
                         'FOREARMS', 'CORE', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES',
                         'CALVES', 'NECK', 'ADDUCTORS', 'ABDUCTORS'))
);
CREATE INDEX idx_muscles_group ON muscles (muscle_group);

-- ---------------------------------------------------------------------------
-- muscle_heads : trainable heads of muscles that have distinct subdivisions
-- ---------------------------------------------------------------------------
CREATE TABLE muscle_heads (
    id               VARCHAR(60) PRIMARY KEY,
    parent_muscle_id VARCHAR(60) NOT NULL REFERENCES muscles (id) ON DELETE CASCADE,
    name             VARCHAR(80) NOT NULL
);
CREATE INDEX idx_muscle_heads_parent ON muscle_heads (parent_muscle_id);

-- ---------------------------------------------------------------------------
-- exercises : the catalogue (one row per movement)
-- ---------------------------------------------------------------------------
CREATE TABLE exercises (
    id        VARCHAR(160) PRIMARY KEY,
    name      VARCHAR(200) NOT NULL,
    category  VARCHAR(30)  NOT NULL
                  CHECK (category IN (
                      'CARDIO', 'OLYMPIC_WEIGHTLIFTING', 'PLYOMETRICS',
                      'POWERLIFTING', 'STRENGTH', 'STRETCHING', 'STRONGMAN')),
    level     VARCHAR(20)  NOT NULL
                  CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT')),
    equipment VARCHAR(20)
                  CHECK (equipment IS NULL OR equipment IN (
                      'BANDS', 'BARBELL', 'BODYWEIGHT', 'CABLE', 'DUMBBELL',
                      'EZ_CURL_BAR', 'EXERCISE_BALL', 'FOAM_ROLL', 'KETTLEBELL',
                      'MACHINE', 'MEDICINE_BALL', 'OTHER')),
    mechanic  VARCHAR(20)
                  CHECK (mechanic IS NULL OR mechanic IN ('COMPOUND', 'ISOLATION')),
    force     VARCHAR(20)
                  CHECK (force IS NULL OR force IN ('PUSH', 'PULL', 'STATIC'))
);
CREATE INDEX idx_exercises_category ON exercises (category);
CREATE INDEX idx_exercises_equipment ON exercises (equipment);

-- ---------------------------------------------------------------------------
-- exercise_instructions : ordered step-by-step instructions (@ElementCollection)
-- ---------------------------------------------------------------------------
CREATE TABLE exercise_instructions (
    exercise_id VARCHAR(160) NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    position    INTEGER      NOT NULL,
    instruction TEXT         NOT NULL,
    PRIMARY KEY (exercise_id, position)
);

-- ---------------------------------------------------------------------------
-- exercise_muscles : muscle involvements with role + volume contribution
-- ---------------------------------------------------------------------------
CREATE TABLE exercise_muscles (
    exercise_id  VARCHAR(160) NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    position     INTEGER      NOT NULL,
    muscle_id    VARCHAR(60)  NOT NULL REFERENCES muscles (id),
    role         VARCHAR(20)  NOT NULL
                     CHECK (role IN ('PRIMARY', 'SECONDARY', 'STABILIZER')),
    contribution NUMERIC(3,2),
    PRIMARY KEY (exercise_id, position)
);
CREATE INDEX idx_exercise_muscles_muscle ON exercise_muscles (muscle_id);

-- ---------------------------------------------------------------------------
-- exercise_media : ordered images / videos for a movement (@ElementCollection)
-- ---------------------------------------------------------------------------
CREATE TABLE exercise_media (
    exercise_id   VARCHAR(160) NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    position      INTEGER      NOT NULL,
    kind          VARCHAR(10)  NOT NULL CHECK (kind IN ('IMAGE', 'VIDEO')),
    source        VARCHAR(10)  NOT NULL CHECK (source IN ('FILE', 'YOUTUBE')),
    url           VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    PRIMARY KEY (exercise_id, position)
);
