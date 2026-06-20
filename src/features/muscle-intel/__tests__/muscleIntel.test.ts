import { describe, expect, it } from 'vitest'
import type { Exercise, MuscleInvolvement } from '../../../domain/models/Exercise'
import type { Muscle } from '../../../domain/models/Muscle'
import type { WorkoutLog, WorkoutLogExercise } from '../../../domain/models/WorkoutLog'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { SessionStatus } from '../../../domain/enums/SessionStatus'
import {
  computeMuscleIntel,
  TrainingStatus,
  MuscleReadiness,
  RecoveryAdvice,
  type MuscleGroupIntel,
} from '../muscleIntel'

// --- Fixtures -------------------------------------------------------------

const NOW = new Date('2026-06-20T12:00:00.000Z')

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function inv(muscleId: string, role: MuscleRole): MuscleInvolvement {
  // contribution is left to the engine's role default (Primary 1, Secondary 0.5).
  return { muscleId, role }
}

/** Minimal exercise — the engine only reads `id` + `muscles`. */
function exercise(id: string, muscles: MuscleInvolvement[]): Exercise {
  return { id, name: id, muscles } as unknown as Exercise
}

const EXERCISES: ReadonlyMap<string, Exercise> = new Map<string, Exercise>([
  // chest primary, triceps + shoulders secondary
  ['bench', exercise('bench', [
    inv('m_chest', MuscleRole.Primary),
    inv('m_triceps', MuscleRole.Secondary),
    inv('m_delts', MuscleRole.Secondary),
  ])],
  ['curl', exercise('curl', [inv('m_biceps', MuscleRole.Primary)])],
])

const MUSCLES: ReadonlyMap<string, Muscle> = new Map<string, Muscle>([
  ['m_chest', { id: 'm_chest', name: 'Pecs', group: MuscleGroup.Chest }],
  ['m_triceps', { id: 'm_triceps', name: 'Tris', group: MuscleGroup.Triceps }],
  ['m_delts', { id: 'm_delts', name: 'Delts', group: MuscleGroup.Shoulders }],
  ['m_biceps', { id: 'm_biceps', name: 'Bis', group: MuscleGroup.Biceps }],
])

function setEx(exerciseRef: string, sets: number, completed = true): WorkoutLogExercise {
  return { exerciseRef, exerciseName: exerciseRef, position: 0, sets, reps: 10, weightKg: 50, completed }
}

function log(
  completedAt: Date | null,
  exercises: WorkoutLogExercise[],
  status: SessionStatus = SessionStatus.Completed,
): WorkoutLog {
  return {
    id: Math.random().toString(36),
    sessionId: 'push',
    name: 'Push',
    focus: null,
    status,
    startedAt: completedAt ? completedAt.toISOString() : null,
    completedAt: completedAt ? completedAt.toISOString() : null,
    durationSeconds: 3600,
    exercises,
  }
}

function group(summary: { groups: readonly MuscleGroupIntel[] }, g: MuscleGroup): MuscleGroupIntel {
  const found = summary.groups.find((x) => x.group === g)
  if (!found) throw new Error(`group ${g} missing`)
  return found
}

// --- Tests ----------------------------------------------------------------

describe('computeMuscleIntel', () => {
  it('reports no data and fully-recovered defaults for an empty history', () => {
    const s = computeMuscleIntel([], EXERCISES, MUSCLES, NOW)
    expect(s.hasData).toBe(false)
    const chest = group(s, MuscleGroup.Chest)
    expect(chest.weeklyEffectiveSets).toBe(0)
    expect(chest.trainingStatus).toBe(TrainingStatus.Untrained)
    expect(chest.readiness).toBe(MuscleReadiness.Ready)
    expect(chest.recoveryPct).toBe(100)
    expect(chest.hoursSinceLast).toBeNull()
    expect(chest.lastTrainedAt).toBeNull()
  })

  it('ignores non-completed sessions and non-completed exercises', () => {
    const s = computeMuscleIntel(
      [
        log(NOW, [setEx('bench', 4)], SessionStatus.InProgress),
        log(NOW, [setEx('bench', 4, false)]),
      ],
      EXERCISES,
      MUSCLES,
      NOW,
    )
    expect(s.hasData).toBe(false)
    expect(group(s, MuscleGroup.Chest).weeklyEffectiveSets).toBe(0)
  })

  it('distributes effective sets across roles (primary 1.0, secondary 0.5)', () => {
    const s = computeMuscleIntel([log(NOW, [setEx('bench', 4)])], EXERCISES, MUSCLES, NOW)
    expect(s.hasData).toBe(true)
    const chest = group(s, MuscleGroup.Chest)
    expect(chest.weeklyEffectiveSets).toBe(4) // 4 × 1.0
    expect(chest.roleBreakdown.primary).toBe(4)
    expect(group(s, MuscleGroup.Triceps).weeklyEffectiveSets).toBe(2) // 4 × 0.5
    expect(group(s, MuscleGroup.Triceps).roleBreakdown.secondary).toBe(2)
    expect(group(s, MuscleGroup.Shoulders).weeklyEffectiveSets).toBe(2)
  })

  it('classifies weekly volume against the group landmarks', () => {
    // chest landmarks: mev 10, mrv 22
    expect(group(computeMuscleIntel([log(NOW, [setEx('bench', 4)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).trainingStatus)
      .toBe(TrainingStatus.Undertrained)
    expect(group(computeMuscleIntel([log(NOW, [setEx('bench', 12)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).trainingStatus)
      .toBe(TrainingStatus.Optimal)
    expect(group(computeMuscleIntel([log(NOW, [setEx('bench', 24)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).trainingStatus)
      .toBe(TrainingStatus.Overtrained)
  })

  it('drops volume outside the 7-day window but still tracks recovery', () => {
    const tenDaysAgo = new Date(NOW.getTime() - 10 * DAY)
    const chest = group(computeMuscleIntel([log(tenDaysAgo, [setEx('bench', 12)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest)
    expect(chest.weeklyEffectiveSets).toBe(0) // out of window
    expect(chest.trainingStatus).toBe(TrainingStatus.Untrained)
    expect(chest.lastTrainedAt).not.toBeNull() // recency still recorded
    expect(chest.recoveryPct).toBe(100) // long since trained → recovered
    expect(chest.readiness).toBe(MuscleReadiness.Ready)
  })

  it('models recovery from time since the last stimulus, scaled by its load', () => {
    // chest: recoveryHours 48, referenceSessionLoad 6 → 6 chest sets = factor 1 → 48h needed.
    const oneHourAgo = group(computeMuscleIntel([log(new Date(NOW.getTime() - HOUR), [setEx('bench', 6)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest)
    expect(oneHourAgo.readiness).toBe(MuscleReadiness.Fatigued)
    expect(oneHourAgo.recoveryPct).toBeCloseTo((1 / 48) * 100, 5)

    const thirtyHoursAgo = group(computeMuscleIntel([log(new Date(NOW.getTime() - 30 * HOUR), [setEx('bench', 6)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest)
    expect(thirtyHoursAgo.readiness).toBe(MuscleReadiness.Recovering)

    const twoDaysAgo = group(computeMuscleIntel([log(new Date(NOW.getTime() - 48 * HOUR), [setEx('bench', 6)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest)
    expect(twoDaysAgo.recoveryPct).toBe(100)
    expect(twoDaysAgo.readiness).toBe(MuscleReadiness.Ready)
  })

  it('keeps the most recent session as the recovery driver across multiple logs', () => {
    const s = computeMuscleIntel(
      [
        log(new Date(NOW.getTime() - 5 * DAY), [setEx('bench', 6)]),
        log(new Date(NOW.getTime() - HOUR), [setEx('bench', 6)]),
      ],
      EXERCISES,
      MUSCLES,
      NOW,
    )
    const chest = group(s, MuscleGroup.Chest)
    expect(chest.weeklyEffectiveSets).toBe(12) // both sessions in window
    expect(chest.readiness).toBe(MuscleReadiness.Fatigued) // recency = 1h ago
  })

  it('maps status + readiness to a single recovery recommendation', () => {
    // Overtrained today → reduce volume (wins over fatigue).
    expect(group(computeMuscleIntel([log(NOW, [setEx('bench', 24)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).advice)
      .toBe(RecoveryAdvice.ReduceVolume)

    // Trained 6 days ago (in window, fully recovered): low volume → add volume.
    const sixDaysAgo = new Date(NOW.getTime() - 6 * DAY)
    expect(group(computeMuscleIntel([log(sixDaysAgo, [setEx('bench', 4)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).advice)
      .toBe(RecoveryAdvice.AddVolume)

    // Same recency, productive volume → good to train.
    expect(group(computeMuscleIntel([log(sixDaysAgo, [setEx('bench', 12)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).advice)
      .toBe(RecoveryAdvice.GoodToTrain)

    // Productive volume but trained today → keep resting.
    expect(group(computeMuscleIntel([log(NOW, [setEx('bench', 12)])], EXERCISES, MUSCLES, NOW), MuscleGroup.Chest).advice)
      .toBe(RecoveryAdvice.KeepResting)
  })

  it('rolls up whole-body counts', () => {
    const s = computeMuscleIntel([log(NOW, [setEx('bench', 24), setEx('curl', 4)])], EXERCISES, MUSCLES, NOW)
    expect(s.overtrainedCount).toBe(1) // chest
    // biceps 4 < mev 8 → undertrained; the untouched groups are untrained too.
    expect(s.undertrainedCount).toBeGreaterThanOrEqual(1)
    expect(group(s, MuscleGroup.Biceps).trainingStatus).toBe(TrainingStatus.Undertrained)
  })
})
