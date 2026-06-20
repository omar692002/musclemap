/**
 * Lifecycle state of a tracked workout session (EM6). Mirrors the backend
 * `com.musclemap.workout.SessionStatus`; the full runner only ever creates
 * `Completed` sessions, but the vocabulary is kept whole so the value is never
 * a magic string.
 */
export enum SessionStatus {
  Planned = 'PLANNED',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}
