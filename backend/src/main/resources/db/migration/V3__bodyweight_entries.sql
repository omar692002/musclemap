-- ===========================================================================
-- MuscleMap - EM7: Progress Analytics
-- Adds bodyweight tracking so the analytics screen can chart bodyweight
-- evolution alongside the frequency / volume / PR analytics derived from the
-- EM6 session history. One weigh-in per user per day (the service upserts),
-- so the chart has a clean daily series. Flyway stays the single source of truth.
-- ===========================================================================

CREATE TABLE bodyweight_entries (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    weight_kg   NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 999.99),
    recorded_on DATE         NOT NULL,
    note        VARCHAR(200),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- At most one weigh-in per day per user; same-day logs replace the value.
    CONSTRAINT uq_bodyweight_user_day UNIQUE (user_id, recorded_on)
);
CREATE INDEX idx_bodyweight_entries_user ON bodyweight_entries (user_id);
