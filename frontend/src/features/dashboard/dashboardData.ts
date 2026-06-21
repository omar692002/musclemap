/**
 * Workout-activity data feeding the dashboard's streak / weekly-activity /
 * recent sections (EM4), now powered by real tracked sessions (EM6).
 *
 * {@link getWorkoutActivity} reads the locally cached logs synchronously (so the
 * dashboard renders immediately), and {@link useWorkoutActivity} additionally
 * refreshes from the backend when one is configured. Both derive from the same
 * pure {@link computeActivity} over the user's completed {@link WorkoutLog}s.
 */
import { useEffect, useState } from 'react'
import type { WorkoutLog } from '../../domain/models/WorkoutLog'
import { SessionStatus } from '../../domain/enums/SessionStatus'
import { listWorkouts, readLocalWorkouts } from '../workouts/workoutApi'

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

/** A week with nothing logged yet — the empty baseline. */
export const EMPTY_ACTIVITY: WorkoutActivity = {
  weekDays: [false, false, false, false, false, false, false],
  currentStreak: 0,
  thisWeekCount: 0,
  recent: [],
}

/** How many recent workouts the dashboard surfaces. */
const RECENT_LIMIT = 5

/** A local-date key (yyyy-mm-dd) so day comparisons ignore the time of day. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** Monday-based weekday index of a date (Mon = 0 … Sun = 6). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Local midnight of the Monday that starts the given date's week. */
function startOfWeek(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - mondayIndex(date))
  return monday
}

/**
 * Derives the dashboard activity from a user's logs. Only **completed** sessions
 * with a `completedAt` count. Pure (the `now` is injectable) so it's unit-testable.
 */
export function computeActivity(logs: readonly WorkoutLog[], now: Date = new Date()): WorkoutActivity {
  const completed = logs
    .filter((log) => log.status === SessionStatus.Completed && log.completedAt)
    .map((log) => ({ log, at: new Date(log.completedAt as string) }))
    .filter((entry) => !Number.isNaN(entry.at.getTime()))

  if (completed.length === 0) return EMPTY_ACTIVITY

  const trainedDays = new Set(completed.map((entry) => dayKey(entry.at)))

  // Weekly strip + this-week count, anchored to the current Monday.
  const weekStart = startOfWeek(now)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    return trainedDays.has(dayKey(day))
  })
  const thisWeekCount = completed.filter((entry) => entry.at >= weekStart).length

  // Streak: consecutive trained days ending today (or yesterday, so an
  // as-yet-untrained today doesn't reset a live streak).
  let streak = 0
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!trainedDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (trainedDays.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const recent = completed
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, RECENT_LIMIT)
    .map(({ log }) => ({
      id: log.id,
      sessionId: log.sessionId,
      title: log.name,
      completedAt: log.completedAt as string,
    }))

  return { weekDays, currentStreak: streak, thisWeekCount, recent }
}

/**
 * The current user's workout activity from the local cache (synchronous). Use
 * {@link useWorkoutActivity} in components to also pick up backend updates.
 */
export function getWorkoutActivity(): WorkoutActivity {
  return computeActivity(readLocalWorkouts())
}

/**
 * Reactive activity for the dashboard: seeds from the local cache, then refreshes
 * from the backend (when configured) on mount.
 */
export function useWorkoutActivity(): WorkoutActivity {
  const [activity, setActivity] = useState<WorkoutActivity>(getWorkoutActivity)

  useEffect(() => {
    let active = true
    listWorkouts()
      .then((logs) => {
        if (active) setActivity(computeActivity(logs))
      })
      .catch(() => {
        // Keep the local-cache seed on any failure.
      })
    return () => {
      active = false
    }
  }, [])

  return activity
}
