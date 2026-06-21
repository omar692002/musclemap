/**
 * Advanced Muscle Intelligence (EM8) — pure, testable engine.
 *
 * Maps the EM6 workout history onto muscle groups (via each exercise's
 * role-weighted {@link MuscleInvolvement}, the same `contribution` weighting the
 * generator uses for its volume readout) to derive, per muscle group:
 *  - **role-detail effective sets** (primary / secondary / stabilizer breakdown),
 *  - **training status** vs evidence-based weekly volume landmarks (MEV/MAV/MRV),
 *  - **recovery readiness** from time-since-last-stimulus, scaled by that
 *    session's load, against the group's modelled recovery window,
 *  - a single **recovery recommendation**.
 *
 * Everything is a pure function of the user's {@link WorkoutLog}s + the static
 * exercise/muscle catalogues (the `now` is injectable), so it carries no backend
 * or React concern — the page just renders the result.
 *
 * Only **completed** exercises in **completed** sessions contribute (consistent
 * with EM7 analytics). Effective sets = completed sets × the involvement's
 * `contribution` (Primary 1.0, Secondary 0.5, Stabilizer 0.25 by default). The
 * source dataset carries no stabilizer involvements yet, so that role reads 0
 * until the documented curation pass lands — the engine already handles it.
 */
import type { WorkoutLog } from '../../domain/models/WorkoutLog'
import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import { SessionStatus } from '../../domain/enums/SessionStatus'
import { TrainingStatus } from '../../domain/enums/TrainingStatus'
import { MuscleReadiness } from '../../domain/enums/MuscleReadiness'
import { RecoveryAdvice } from '../../domain/enums/RecoveryAdvice'
import {
  GROUP_MODELS,
  INTEL_GROUPS,
  MuscleIntelConfig,
  type VolumeLandmarks,
} from '../../config/muscleIntel.config'
import { ROLE_DEFAULT_CONTRIBUTION } from '../../data/static/mapping/sourceMuscleMap'

/** Effective sets a group received, split by the role it played. */
export interface RoleBreakdown {
  readonly primary: number
  readonly secondary: number
  readonly stabilizer: number
}

/** The full intelligence readout for one muscle group. */
export interface MuscleGroupIntel {
  readonly group: MuscleGroup
  /** Effective sets in the rolling {@link MuscleIntelConfig.windowDays}-day window. */
  readonly weeklyEffectiveSets: number
  readonly roleBreakdown: RoleBreakdown
  readonly landmarks: VolumeLandmarks
  readonly trainingStatus: TrainingStatus
  /** ISO timestamp of the most recent session that trained this group, or null. */
  readonly lastTrainedAt: string | null
  /** Hours since {@link lastTrainedAt}, or null if never trained. */
  readonly hoursSinceLast: number | null
  /** 0…100 — modelled recovery from the last stimulus (100 = fully recovered). */
  readonly recoveryPct: number
  readonly readiness: MuscleReadiness
  readonly advice: RecoveryAdvice
}

/** The whole-body readout the page renders. */
export interface MuscleIntelSummary {
  /** False until at least one completed exercise maps onto a tracked group. */
  readonly hasData: boolean
  /** One entry per {@link INTEL_GROUPS} group, in that display order. */
  readonly groups: readonly MuscleGroupIntel[]
  readonly overtrainedCount: number
  readonly undertrainedCount: number
  readonly readyCount: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** A group's running totals while folding over the history. */
interface GroupAcc {
  weekly: number
  byRole: Record<MuscleRole, number>
  lastAt: number | null
  /** Effective sets the most-recent session gave this group (drives recovery). */
  lastLoad: number
}

function emptyAcc(): GroupAcc {
  return {
    weekly: 0,
    byRole: { [MuscleRole.Primary]: 0, [MuscleRole.Secondary]: 0, [MuscleRole.Stabilizer]: 0 },
    lastAt: null,
    lastLoad: 0,
  }
}

/** Completed sessions with a valid completion timestamp, paired with their epoch ms. */
function completedSessions(logs: readonly WorkoutLog[]): { log: WorkoutLog; at: number }[] {
  return logs
    .filter((log) => log.status === SessionStatus.Completed && log.completedAt)
    .map((log) => ({ log, at: new Date(log.completedAt as string).getTime() }))
    .filter((entry) => !Number.isNaN(entry.at))
}

function classifyVolume(weekly: number, { mev, mrv }: VolumeLandmarks): TrainingStatus {
  if (weekly <= 0) return TrainingStatus.Untrained
  if (weekly < mev) return TrainingStatus.Undertrained
  if (weekly > mrv) return TrainingStatus.Overtrained
  return TrainingStatus.Optimal
}

function classifyReadiness(recoveryPct: number): MuscleReadiness {
  const { readyPct, recoveringPct } = MuscleIntelConfig.readiness
  if (recoveryPct >= readyPct) return MuscleReadiness.Ready
  if (recoveryPct >= recoveringPct) return MuscleReadiness.Recovering
  return MuscleReadiness.Fatigued
}

function adviceFor(status: TrainingStatus, readiness: MuscleReadiness): RecoveryAdvice {
  if (status === TrainingStatus.Overtrained) return RecoveryAdvice.ReduceVolume
  if (readiness !== MuscleReadiness.Ready) return RecoveryAdvice.KeepResting
  if (status === TrainingStatus.Untrained || status === TrainingStatus.Undertrained) {
    return RecoveryAdvice.AddVolume
  }
  return RecoveryAdvice.GoodToTrain
}

/**
 * Derives the whole-body intelligence readout. Pure & testable.
 *
 * @param logs           the user's workout history (EM6).
 * @param exerciseIndex  exerciseRef → {@link Exercise} (for muscle involvements).
 * @param muscleIndex    muscleId → {@link Muscle} (for the muscle's group).
 * @param now            injectable clock for the rolling window + recovery math.
 */
export function computeMuscleIntel(
  logs: readonly WorkoutLog[],
  exerciseIndex: ReadonlyMap<string, Exercise>,
  muscleIndex: ReadonlyMap<string, Muscle>,
  now: Date = new Date(),
): MuscleIntelSummary {
  const nowMs = now.getTime()
  const cutoff = nowMs - MuscleIntelConfig.windowDays * 24 * 60 * 60 * 1000

  const accByGroup = new Map<MuscleGroup, GroupAcc>()
  const accFor = (group: MuscleGroup): GroupAcc => {
    let acc = accByGroup.get(group)
    if (!acc) {
      acc = emptyAcc()
      accByGroup.set(group, acc)
    }
    return acc
  }

  for (const { log, at } of completedSessions(logs)) {
    const inWindow = at >= cutoff
    // Per-group load for THIS session — drives the recency/recovery read.
    const sessionLoad = new Map<MuscleGroup, number>()

    for (const ex of log.exercises) {
      if (!ex.completed) continue
      const sets = ex.sets ?? 0
      if (sets <= 0) continue
      const exercise = exerciseIndex.get(ex.exerciseRef)
      if (!exercise) continue

      for (const inv of exercise.muscles) {
        const group = muscleIndex.get(inv.muscleId)?.group
        if (!group) continue
        const contribution = inv.contribution ?? ROLE_DEFAULT_CONTRIBUTION[inv.role]
        const effective = sets * contribution
        sessionLoad.set(group, (sessionLoad.get(group) ?? 0) + effective)
        if (inWindow) {
          const acc = accFor(group)
          acc.weekly += effective
          acc.byRole[inv.role] += effective
        }
      }
    }

    // Record this session as the latest stimulus for each group it hit.
    for (const [group, load] of sessionLoad) {
      const acc = accFor(group)
      if (acc.lastAt == null || at > acc.lastAt) {
        acc.lastAt = at
        acc.lastLoad = load
      }
    }
  }

  const groups: MuscleGroupIntel[] = INTEL_GROUPS.map((group) => {
    const acc = accByGroup.get(group) ?? emptyAcc()
    const { landmarks, recoveryHours } = GROUP_MODELS[group]
    const trainingStatus = classifyVolume(acc.weekly, landmarks)

    let hoursSinceLast: number | null = null
    let recoveryPct = 100
    if (acc.lastAt != null) {
      hoursSinceLast = (nowMs - acc.lastAt) / (60 * 60 * 1000)
      const loadFactor = clamp(
        acc.lastLoad / MuscleIntelConfig.referenceSessionLoad,
        MuscleIntelConfig.loadFactor.min,
        MuscleIntelConfig.loadFactor.max,
      )
      const neededHours = recoveryHours * loadFactor
      recoveryPct = clamp((hoursSinceLast / neededHours) * 100, 0, 100)
    }
    const readiness = classifyReadiness(recoveryPct)

    return {
      group,
      weeklyEffectiveSets: acc.weekly,
      roleBreakdown: {
        primary: acc.byRole[MuscleRole.Primary],
        secondary: acc.byRole[MuscleRole.Secondary],
        stabilizer: acc.byRole[MuscleRole.Stabilizer],
      },
      landmarks,
      trainingStatus,
      lastTrainedAt: acc.lastAt != null ? new Date(acc.lastAt).toISOString() : null,
      hoursSinceLast,
      recoveryPct,
      readiness,
      advice: adviceFor(trainingStatus, readiness),
    }
  })

  return {
    hasData: groups.some((g) => g.lastTrainedAt != null),
    groups,
    overtrainedCount: groups.filter((g) => g.trainingStatus === TrainingStatus.Overtrained).length,
    undertrainedCount: groups.filter(
      (g) =>
        g.trainingStatus === TrainingStatus.Undertrained ||
        g.trainingStatus === TrainingStatus.Untrained,
    ).length,
    readyCount: groups.filter((g) => g.readiness === MuscleReadiness.Ready).length,
  }
}

// Re-exported so the engine's enums are reachable from one import in the UI/tests.
export { TrainingStatus, MuscleReadiness, RecoveryAdvice }
