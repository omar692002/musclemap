/**
 * Pure progress-analytics computations (EM7), derived from the EM6 session
 * history. Everything here is a pure function of the user's {@link WorkoutLog}s
 * (the `now` is injectable) so it's fully unit-testable and free of any backend
 * or React concern — the page and charts just render the result.
 *
 * Volume follows the standard tonnage definition (sets × reps × weight) and PRs
 * use the Epley estimated one-rep-max, so a rep PR at a lighter weight still
 * counts. Only **completed** exercises in **completed** sessions contribute.
 */
import type { WorkoutLog, WorkoutLogExercise } from '../../domain/models/WorkoutLog'
import { SessionStatus } from '../../domain/enums/SessionStatus'

/** One week of training, keyed by its Monday (Mon→Sun, local time). */
export interface WeekBucket {
  /** Local-date key (yyyy-m-d) of the week's Monday — identity for the bucket. */
  readonly key: string
  /** The week's Monday at local midnight (for axis labels). */
  readonly weekStart: Date
  readonly sessions: number
  readonly volumeKg: number
  readonly sets: number
}

/** A personal record for one exercise (best estimated 1RM across all logs). */
export interface PersonalRecord {
  readonly exerciseRef: string
  readonly exerciseName: string
  readonly maxWeightKg: number
  readonly repsAtBest: number
  /** Epley estimate: weight × (1 + reps / 30). */
  readonly estimatedOneRepMaxKg: number
  /** ISO timestamp of the session in which the PR was set. */
  readonly achievedAt: string
}

/** The full analytics readout the page renders. */
export interface AnalyticsSummary {
  /** False when no completed session has any logged work yet (drives empty state). */
  readonly hasData: boolean
  readonly totalWorkouts: number
  readonly totalVolumeKg: number
  readonly totalSets: number
  /** The most recent {@link WEEKS_WINDOW} weeks, chronological, gaps zero-filled. */
  readonly weeks: readonly WeekBucket[]
  /** Strongest exercises first, capped at {@link PR_LIMIT}. */
  readonly prs: readonly PersonalRecord[]
  readonly thisWeek: WeekBucket
  readonly lastWeek: WeekBucket
}

/** How many recent weeks the charts span. */
export const WEEKS_WINDOW = 8

/** How many personal records the page surfaces. */
export const PR_LIMIT = 6

/** A local-date key (yyyy-m-d) so day/week comparisons ignore time of day. */
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

/** Tonnage of one logged exercise (0 unless completed with numeric set/rep/weight). */
function exerciseVolume(ex: WorkoutLogExercise): number {
  if (!ex.completed) return 0
  return (ex.sets ?? 0) * (ex.reps ?? 0) * (ex.weightKg ?? 0)
}

/** Completed working sets of one logged exercise. */
function exerciseSets(ex: WorkoutLogExercise): number {
  if (!ex.completed) return 0
  return ex.sets ?? 0
}

/** Epley estimated one-rep max. */
function epleyOneRepMax(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30)
}

const ZERO_WEEK: Omit<WeekBucket, 'key' | 'weekStart'> = { sessions: 0, volumeKg: 0, sets: 0 }

/** Completed sessions with a valid completion timestamp, paired with their date. */
function completedSessions(logs: readonly WorkoutLog[]): { log: WorkoutLog; at: Date }[] {
  return logs
    .filter((log) => log.status === SessionStatus.Completed && log.completedAt)
    .map((log) => ({ log, at: new Date(log.completedAt as string) }))
    .filter((entry) => !Number.isNaN(entry.at.getTime()))
}

/** Rolls completed sessions into the last {@link WEEKS_WINDOW} weeks (zero-filled). */
function buildWeeks(sessions: { log: WorkoutLog; at: Date }[], now: Date): WeekBucket[] {
  const totals = new Map<string, { sessions: number; volumeKg: number; sets: number }>()
  for (const { log, at } of sessions) {
    const key = dayKey(startOfWeek(at))
    const bucket = totals.get(key) ?? { sessions: 0, volumeKg: 0, sets: 0 }
    bucket.sessions += 1
    for (const ex of log.exercises) {
      bucket.volumeKg += exerciseVolume(ex)
      bucket.sets += exerciseSets(ex)
    }
    totals.set(key, bucket)
  }

  const thisMonday = startOfWeek(now)
  const weeks: WeekBucket[] = []
  for (let i = WEEKS_WINDOW - 1; i >= 0; i -= 1) {
    const weekStart = new Date(thisMonday)
    weekStart.setDate(thisMonday.getDate() - i * 7)
    const key = dayKey(weekStart)
    weeks.push({ key, weekStart, ...(totals.get(key) ?? ZERO_WEEK) })
  }
  return weeks
}

/** Best estimated-1RM record per exercise across all completed work. */
function buildPersonalRecords(sessions: { log: WorkoutLog; at: Date }[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>()
  for (const { log } of sessions) {
    for (const ex of log.exercises) {
      if (!ex.completed || !ex.weightKg || ex.weightKg <= 0 || !ex.reps || ex.reps <= 0) continue
      const estimate = epleyOneRepMax(ex.weightKg, ex.reps)
      const current = best.get(ex.exerciseRef)
      if (!current || estimate > current.estimatedOneRepMaxKg) {
        best.set(ex.exerciseRef, {
          exerciseRef: ex.exerciseRef,
          exerciseName: ex.exerciseName || ex.exerciseRef,
          maxWeightKg: ex.weightKg,
          repsAtBest: ex.reps,
          estimatedOneRepMaxKg: estimate,
          achievedAt: log.completedAt as string,
        })
      }
    }
  }
  return [...best.values()]
    .sort((a, b) => b.estimatedOneRepMaxKg - a.estimatedOneRepMaxKg)
    .slice(0, PR_LIMIT)
}

/** Derives the full analytics readout from a user's logs. Pure & testable. */
export function computeAnalytics(logs: readonly WorkoutLog[], now: Date = new Date()): AnalyticsSummary {
  const sessions = completedSessions(logs)
  const weeks = buildWeeks(sessions, now)
  const prs = buildPersonalRecords(sessions)

  let totalVolumeKg = 0
  let totalSets = 0
  for (const { log } of sessions) {
    for (const ex of log.exercises) {
      totalVolumeKg += exerciseVolume(ex)
      totalSets += exerciseSets(ex)
    }
  }

  const thisWeek = weeks[weeks.length - 1]
  const lastWeek = weeks[weeks.length - 2]
  const hasData = sessions.length > 0

  return {
    hasData,
    totalWorkouts: sessions.length,
    totalVolumeKg,
    totalSets,
    weeks,
    prs,
    thisWeek,
    lastWeek,
  }
}
