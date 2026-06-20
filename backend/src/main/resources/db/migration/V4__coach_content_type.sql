-- ===========================================================================
-- MuscleMap - Evolution Milestone 10 (Coach Platform)
-- The coach_videos table already exists (V1). EM10 adds a content_type so a
-- coach item can be a technique demo, an educational lesson, or a program,
-- covering "uploads videos / creates programs / publishes educational content".
-- VARCHAR + CHECK keeps the DB in sync with com.musclemap.coach.CoachContentType
-- (same convention as every other enum-like column in this schema).
-- ===========================================================================

ALTER TABLE coach_videos
    ADD COLUMN content_type VARCHAR(20) NOT NULL DEFAULT 'TECHNIQUE'
        CHECK (content_type IN ('TECHNIQUE', 'EDUCATION', 'PROGRAM'));

-- The consumer library lists published content; index the common filter.
CREATE INDEX idx_coach_videos_content_type ON coach_videos (content_type);
