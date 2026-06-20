/**
 * Kind of coach-authored content (EM10). Mirrors the backend
 * `com.musclemap.coach.CoachContentType`; the string values match the persisted
 * enum names so the same value travels UI → API → DB unchanged.
 */
export enum CoachContentType {
  /** A demonstration of how to perform a single exercise (the default). */
  Technique = 'TECHNIQUE',
  /** An educational lesson: form cues, anatomy, programming theory. */
  Education = 'EDUCATION',
  /** A full training program published for members to follow. */
  Program = 'PROGRAM',
}
