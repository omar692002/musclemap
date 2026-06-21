import { describe, expect, it } from 'vitest'
import type { WorkoutLog } from '../../../domain/models/WorkoutLog'
import { SessionStatus } from '../../../domain/enums/SessionStatus'
import { computeActivity, EMPTY_ACTIVITY } from '../dashboardData'

/** A fixed "now": noon on Wed 17 Jun 2026. */
const NOW = new Date(2026, 5, 17, 12, 0, 0)

/** ISO timestamp for `daysAgo` before NOW (defaults to mid-morning). */
function at(daysAgo: number, hour = 10): string {
  return new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - daysAgo, hour).toISOString()
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
    exercises: [],
    ...overrides,
  }
}

describe('computeActivity', () => {
  it('returns the empty baseline when there are no completed logs', () => {
    expect(computeActivity([], NOW)).toBe(EMPTY_ACTIVITY)
  })

  it('ignores sessions that are not completed', () => {
    const planned = log({ status: SessionStatus.Planned })
    expect(computeActivity([planned], NOW)).toBe(EMPTY_ACTIVITY)
  })

  it('marks today on the weekly strip and counts it this week', () => {
    const activity = computeActivity([log({ completedAt: at(0) })], NOW)
    // Wed = Monday-based index 2.
    expect(activity.weekDays).toEqual([false, false, true, false, false, false, false])
    expect(activity.thisWeekCount).toBe(1)
    expect(activity.currentStreak).toBe(1)
    expect(activity.recent).toHaveLength(1)
    expect(activity.recent[0].title).toBe('Chest & Triceps')
  })

  it('counts consecutive trained days as a streak', () => {
    const logs = [log({ completedAt: at(0) }), log({ completedAt: at(1) }), log({ completedAt: at(2) })]
    expect(computeActivity(logs, NOW).currentStreak).toBe(3)
  })

  it('breaks the streak on a gap day', () => {
    const logs = [log({ completedAt: at(0) }), log({ completedAt: at(2) })]
    expect(computeActivity(logs, NOW).currentStreak).toBe(1)
  })

  it('keeps a live streak when today has not been trained yet', () => {
    const logs = [log({ completedAt: at(1) }), log({ completedAt: at(2) })]
    expect(computeActivity(logs, NOW).currentStreak).toBe(2)
  })

  it('returns the five most recent workouts, newest first', () => {
    const logs = [5, 4, 3, 2, 1, 0].map((daysAgo) =>
      log({ name: `Day-${daysAgo}`, completedAt: at(daysAgo) }),
    )
    const recent = computeActivity(logs, NOW).recent
    expect(recent).toHaveLength(5)
    expect(recent[0].title).toBe('Day-0')
    expect(recent[4].title).toBe('Day-4')
  })
})
