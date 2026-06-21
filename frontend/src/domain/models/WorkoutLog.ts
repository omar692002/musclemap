import type { SessionStatus } from '../enums/SessionStatus'

/**
 * One exercise as performed within a tracked workout (EM6). `exerciseRef` is the
 * static-dataset id (free-exercise-db) so the rich catalogue stays on the client
 * while the log records what was actually done.
 */
export interface WorkoutLogExercise {
  readonly exerciseRef: string
  readonly exerciseName: string
  readonly position: number
  readonly sets: number | null
  readonly reps: number | null
  readonly weightKg: number | null
  readonly completed: boolean
}

/**
 * A tracked workout (EM6). Created by the runner when a session is finished and
 * persisted via {@link import('../../features/workouts/workoutApi')}. The same
 * shape round-trips with the backend (`workout_sessions`/`workout_exercises`) and
 * the localStorage fallback, and feeds the dashboard's activity summary.
 */
export interface WorkoutLog {
  /** Backend UUID, or a locally-generated id on the static (no-backend) deploy. */
  readonly id: string
  /** The home session this was started from (a `DayFocus` value or "cardio"). */
  readonly sessionId: string
  readonly name: string
  /** A `DayFocus` value, or null for cardio / ad-hoc sessions. */
  readonly focus: string | null
  readonly status: SessionStatus
  /** ISO timestamps; `completedAt` is the source of truth for activity/streaks. */
  readonly startedAt: string | null
  readonly completedAt: string | null
  readonly durationSeconds: number | null
  readonly exercises: readonly WorkoutLogExercise[]
}
