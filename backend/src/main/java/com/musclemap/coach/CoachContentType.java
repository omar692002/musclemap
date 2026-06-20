package com.musclemap.coach;

/**
 * Kind of coach-authored content (EM10). Persisted as its {@code name()} (see the
 * {@code coach_videos.content_type} CHECK constraint), so the application enum and
 * the DB stay in lockstep without a Postgres ENUM type.
 */
public enum CoachContentType {
    /** A demonstration of how to perform a single exercise (the default). */
    TECHNIQUE,
    /** An educational lesson: form cues, anatomy, programming theory. */
    EDUCATION,
    /** A full training program the coach publishes for members to follow. */
    PROGRAM
}
