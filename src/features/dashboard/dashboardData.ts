/**
 * Workout-activity data feeding the dashboard's streak / weekly-activity / recent
 * sections (EM4).
 *
 * Real session history lands in **EM6 (Workout Tracking)**, which will persist
 * completed sessions to `workout_sessions`. Until then there is no source of
 * truth, so this returns an honest *empty* activity and the dashboard renders its
 * motivating empty states. EM6 only needs to replace {@link getWorkoutActivity}
 * with a backend/local read — the shape below is the contract the UI already
 * consumes.
 */

export interface RecentWorkout {
  readonly id: string
  /** The session that was completed (a `DayFocus` value or "cardio"). */
  readonly sessionId: string
  readonly title: string
  /** ISO timestamp of completion. */
  readonly completedAt: string
}

export interface WorkoutActivity {
  /** Completion flag per weekday of the current week, Monday → Sunday. */
  readonly weekDays: readonly boolean[]
  /** Consecutive days trained up to today. */
  readonly currentStreak: number
  /** Sessions completed since this Monday. */
  readonly thisWeekCount: number
  /** Most recent completed sessions, newest first. */
  readonly recent: readonly RecentWorkout[]
}

/** A week with nothing logged yet — the pre-EM6 baseline. */
export const EMPTY_ACTIVITY: WorkoutActivity = {
  weekDays: [false, false, false, false, false, false, false],
  currentStreak: 0,
  thisWeekCount: 0,
  recent: [],
}

/**
 * The current user's workout activity. Empty until EM6 wires real session
 * tracking; kept as a function so the call sites don't change when it does.
 */
export function getWorkoutActivity(): WorkoutActivity {
  return EMPTY_ACTIVITY
}
