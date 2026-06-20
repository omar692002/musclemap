import { describe, expect, it } from 'vitest'
import type { WorkoutLog, WorkoutLogExercise } from '../../../domain/models/WorkoutLog'
import { SessionStatus } from '../../../domain/enums/SessionStatus'
import { computeAnalytics, WEEKS_WINDOW } from '../analytics'

/** A fixed "now": noon on Wed 17 Jun 2026. */
const NOW = new Date(2026, 5, 17, 12, 0, 0)

/** ISO timestamp `daysAgo` before NOW (mid-morning). */
function at(daysAgo: number): string {
  return new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - daysAgo, 10).toISOString()
}

function ex(overrides: Partial<WorkoutLogExercise> = {}): WorkoutLogExercise {
  return {
    exerciseRef: 'Barbell_Bench_Press',
    exerciseName: 'Barbell Bench Press',
    position: 0,
    sets: 3,
    reps: 10,
    weightKg: 60,
    completed: true,
    ...overrides,
  }
}

function log(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: crypto.randomUUID(),
    sessionId: 'CHEST_TRICEPS',
    name: 'Chest & Triceps',
    focus: 'CHEST_TRICEPS',
    status: SessionStatus.Completed,
    startedAt: null,
    completedAt: at(0),
    durationSeconds: 1800,
    exercises: [ex()],
    ...overrides,
  }
}

describe('computeAnalytics', () => {
  it('reports no data and a zero-filled window when there are no completed logs', () => {
    const summary = computeAnalytics([], NOW)
    expect(summary.hasData).toBe(false)
    expect(summary.totalWorkouts).toBe(0)
    expect(summary.totalVolumeKg).toBe(0)
    expect(summary.weeks).toHaveLength(WEEKS_WINDOW)
    expect(summary.weeks.every((w) => w.sessions === 0)).toBe(true)
    expect(summary.prs).toEqual([])
  })

  it('ignores sessions that are not completed', () => {
    const planned = log({ status: SessionStatus.Planned })
    expect(computeAnalytics([planned], NOW).hasData).toBe(false)
  })

  it('sums tonnage and sets only over completed exercises', () => {
    const session = log({
      exercises: [
        ex({ sets: 3, reps: 10, weightKg: 60, completed: true }), // 1800 kg, 3 sets
        ex({ sets: 4, reps: 8, weightKg: 50, completed: false }), // skipped: not completed
        ex({ sets: 3, reps: 12, weightKg: 0, completed: true }), // bodyweight: 0 kg, 3 sets
      ],
    })
    const summary = computeAnalytics([session], NOW)
    expect(summary.totalVolumeKg).toBe(1800)
    expect(summary.totalSets).toBe(6)
    expect(summary.thisWeek.volumeKg).toBe(1800)
    expect(summary.thisWeek.sessions).toBe(1)
  })

  it('buckets sessions into the right ISO weeks (this week vs last week)', () => {
    // at(0) = Wed this week; at(7) = Wed last week.
    const summary = computeAnalytics([log({ completedAt: at(0) }), log({ completedAt: at(7) })], NOW)
    expect(summary.thisWeek.sessions).toBe(1)
    expect(summary.lastWeek.sessions).toBe(1)
    expect(summary.totalWorkouts).toBe(2)
  })

  it('drops sessions older than the window from the weekly series but keeps totals', () => {
    const old = log({ completedAt: at(7 * (WEEKS_WINDOW + 2)) })
    const summary = computeAnalytics([log({ completedAt: at(0) }), old], NOW)
    const windowSessions = summary.weeks.reduce((sum, w) => sum + w.sessions, 0)
    expect(windowSessions).toBe(1) // only the recent one falls inside the window
    expect(summary.totalWorkouts).toBe(2) // totals still count every completed session
  })

  it('keeps the best estimated-1RM record per exercise', () => {
    const logs = [
      log({ exercises: [ex({ weightKg: 100, reps: 1 })] }), // 1RM ≈ 103.3
      log({ exercises: [ex({ weightKg: 80, reps: 8 })] }), // 1RM ≈ 101.3
      log({ exercises: [ex({ exerciseRef: 'Barbell_Squat', exerciseName: 'Squat', weightKg: 140, reps: 3 })] }),
    ]
    const prs = computeAnalytics(logs, NOW).prs
    const bench = prs.find((p) => p.exerciseRef === 'Barbell_Bench_Press')
    expect(bench?.maxWeightKg).toBe(100)
    expect(bench?.repsAtBest).toBe(1)
    // Sorted strongest first → squat (140) outranks bench.
    expect(prs[0].exerciseRef).toBe('Barbell_Squat')
  })

  it('excludes bodyweight-only exercises from PRs', () => {
    const summary = computeAnalytics([log({ exercises: [ex({ weightKg: 0, reps: 15 })] })], NOW)
    expect(summary.prs).toEqual([])
  })
})
