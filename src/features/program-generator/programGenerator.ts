import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import type {
  GroupRecovery,
  ProgramExercise,
  ProgressionPlan,
  WorkoutDay,
  WorkoutProgram,
} from '../../domain/models/WorkoutProgram'
import type { Equipment } from '../../domain/enums/Equipment'
import { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import { ExerciseMechanic } from '../../domain/enums/ExerciseMechanic'
import { SplitType } from '../../domain/enums/SplitType'
import { TrainingGoal } from '../../domain/enums/TrainingGoal'
import { DayFocus } from '../../domain/enums/DayFocus'
import { Weekday } from '../../domain/enums/Weekday'
import { RecoveryStatus } from '../../domain/enums/RecoveryStatus'
import {
  SPLIT_PATTERNS,
  ProgramConfig,
  GOAL_SCHEMES,
  WEEK_ORDER,
  WEEKLY_LAYOUTS,
  RecoveryConfig,
  type DayTemplate,
} from '../../config/program.config'
import { STRATEGY_BY_GOAL, MESOCYCLE_BY_STRATEGY, overloadCueFor } from '../../config/progression.config'

export interface ProgramParams {
  readonly split: SplitType
  readonly days: number
  /** Allowed equipment; an empty set means "no restriction". */
  readonly equipment: ReadonlySet<Equipment>
  readonly goal: TrainingGoal
  /** Variety seed: same inputs + seed → same week; bump it to "regenerate". */
  readonly seed: number
}

function allowsEquipment(exercise: Exercise, allowed: ReadonlySet<Equipment>): boolean {
  if (allowed.size === 0) return true
  return exercise.equipment != null && allowed.has(exercise.equipment)
}

/** Deterministic per-exercise hash (FNV-1a over id + seed) for seeded ordering. */
function seededRank(id: string, seed: number): number {
  let hash = (seed ^ 0x811c9dc5) >>> 0
  for (let i = 0; i < id.length; i += 1) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 0x01000193) >>> 0
  }
  return hash
}

/** The set/rep prescription for an exercise under the chosen goal. */
export function schemeFor(exercise: Exercise, goal: TrainingGoal) {
  const schemes = GOAL_SCHEMES[goal]
  return exercise.mechanic === ExerciseMechanic.Compound ? schemes.compound : schemes.isolation
}

/** Compares two exercises compound-first, then by a seeded order (for variety). */
export function compoundFirstSeeded(a: Exercise, b: Exercise, seed: number): number {
  const compoundA = a.mechanic === ExerciseMechanic.Compound ? 0 : 1
  const compoundB = b.mechanic === ExerciseMechanic.Compound ? 0 : 1
  return compoundA - compoundB || seededRank(a.id, seed) - seededRank(b.id, seed)
}

/** True when the exercise's equipment is allowed (empty set = no restriction). */
export function exerciseAllowed(exercise: Exercise, allowed: ReadonlySet<Equipment>): boolean {
  return allowsEquipment(exercise, allowed)
}

/** True when the exercise trains `group` as a primary mover. */
function isPrimaryFor(exercise: Exercise, group: MuscleGroup, muscleIndex: ReadonlyMap<string, Muscle>): boolean {
  return exercise.muscles.some(
    (inv) => inv.role === MuscleRole.Primary && muscleIndex.get(inv.muscleId)?.group === group,
  )
}

/** Candidate exercises per group, compound-first then seeded (for variety). */
export function candidatesByGroup(
  exercises: readonly Exercise[],
  allowed: ReadonlySet<Equipment>,
  muscleIndex: ReadonlyMap<string, Muscle>,
  seed: number,
): Map<MuscleGroup, Exercise[]> {
  const byGroup = new Map<MuscleGroup, Exercise[]>()
  for (const group of Object.values(MuscleGroup)) {
    const list = exercises
      .filter((exercise) => allowsEquipment(exercise, allowed) && isPrimaryFor(exercise, group, muscleIndex))
      .sort((a, b) => compoundFirstSeeded(a, b, seed))
    byGroup.set(group, list)
  }
  return byGroup
}

/**
 * Picks up to `perGroup` exercises for each group from the prepared candidates,
 * skipping any already in `used` (so a week never repeats a lift). Each pick is
 * prescribed sets/reps from the goal. Shared by the planner and quick sessions.
 */
export function pickExercises(
  groups: readonly MuscleGroup[],
  candidates: ReadonlyMap<MuscleGroup, readonly Exercise[]>,
  goal: TrainingGoal,
  perGroup: number,
  used: Set<string>,
): ProgramExercise[] {
  const chosen: ProgramExercise[] = []
  for (const group of groups) {
    const pool = candidates.get(group) ?? []
    let picked = 0
    for (const exercise of pool) {
      if (picked >= perGroup) break
      if (used.has(exercise.id)) continue
      used.add(exercise.id)
      const scheme = schemeFor(exercise, goal)
      chosen.push({ exercise, sets: scheme.sets, reps: scheme.repRange })
      picked += 1
    }
  }
  return chosen
}

/** The training-day templates assigned to weekdays, in calendar order. */
type TrainingSchedule = ReadonlyMap<Weekday, DayTemplate>

/**
 * Maps the chosen number of sessions onto the Mon→Sun layout for the day count,
 * cycling the split's templates across the training slots (EM5 recovery logic).
 * Falls back to the first N weekdays if a layout is missing.
 */
function scheduleTrainingDays(split: SplitType, days: number): TrainingSchedule {
  const pattern = SPLIT_PATTERNS[split]
  const layout = WEEKLY_LAYOUTS[days] ?? WEEK_ORDER.slice(0, days)
  const schedule = new Map<Weekday, DayTemplate>()
  layout.forEach((weekday, i) => schedule.set(weekday, pattern[i % pattern.length]))
  return schedule
}

/** Smallest gap (in days) between consecutive entries on a 7-day cycle. */
function minCyclicGap(dayIndices: readonly number[]): number {
  if (dayIndices.length <= 1) return WEEK_ORDER.length
  const sorted = [...dayIndices].sort((a, b) => a - b)
  let min = WEEK_ORDER.length
  for (let i = 1; i < sorted.length; i += 1) min = Math.min(min, sorted[i] - sorted[i - 1])
  // Wrap-around gap from the last session back to the first next week.
  min = Math.min(min, sorted[0] + WEEK_ORDER.length - sorted[sorted.length - 1])
  return min
}

/**
 * Per-group recovery analysis: how often each group is trained and the smallest
 * gap between its sessions, flagged Optimal (≥48h) or Overlap (back-to-back).
 * Ordered by the MuscleGroup enum for a stable readout.
 */
function computeRecovery(schedule: TrainingSchedule): GroupRecovery[] {
  const daysByGroup = new Map<MuscleGroup, number[]>()
  WEEK_ORDER.forEach((weekday, dayIndex) => {
    const template = schedule.get(weekday)
    if (!template) return
    for (const group of template.groups) {
      const list = daysByGroup.get(group) ?? []
      list.push(dayIndex)
      daysByGroup.set(group, list)
    }
  })

  const recovery: GroupRecovery[] = []
  for (const group of Object.values(MuscleGroup)) {
    const dayIndices = daysByGroup.get(group)
    if (!dayIndices) continue
    const minGapDays = minCyclicGap(dayIndices)
    recovery.push({
      group,
      sessionsPerWeek: dayIndices.length,
      minGapDays,
      status: minGapDays >= RecoveryConfig.optimalGapDays ? RecoveryStatus.Optimal : RecoveryStatus.Overlap,
    })
  }
  return recovery
}

/** The 4-week progression plan implied by the training goal. */
function buildProgressionPlan(goal: TrainingGoal): ProgressionPlan {
  const strategy = STRATEGY_BY_GOAL[goal]
  const weeks = MESOCYCLE_BY_STRATEGY[strategy].map((step, i) => ({ week: i + 1, step }))
  return { strategy, weeks }
}

/**
 * Builds a balanced, non-redundant, recovery-aware week (Smart Generator V2, EM5):
 * it lays the split's day templates over a Mon→Sun calendar (spacing sessions so
 * muscle groups get ≥48h, with the remaining days as rest), picks compound-first
 * exercises that fit the equipment and never repeat across the week, and tags each
 * with a goal-aware progressive-overload cue. It then sums effective weekly sets
 * per group (volume readout), analyses per-group recovery, and derives a 4-week
 * progression plan from the goal. Pure and deterministic for a given seed.
 */
export function generateProgram(
  params: ProgramParams,
  exercises: readonly Exercise[],
  muscleIndex: ReadonlyMap<string, Muscle>,
): WorkoutProgram {
  const schedule = scheduleTrainingDays(params.split, params.days)
  const candidates = candidatesByGroup(exercises, params.equipment, muscleIndex, params.seed)
  const strategy = STRATEGY_BY_GOAL[params.goal]
  const used = new Set<string>()

  const days: WorkoutDay[] = WEEK_ORDER.map((weekday, i) => {
    const template = schedule.get(weekday)
    if (!template) {
      return { index: i + 1, weekday, focus: DayFocus.Rest, isRest: true, exercises: [] }
    }
    const chosen = pickExercises(
      template.groups,
      candidates,
      params.goal,
      ProgramConfig.exercisesPerGroup,
      used,
    ).map((item) => ({
      ...item,
      overload: overloadCueFor(strategy, item.exercise.mechanic ?? ExerciseMechanic.Isolation),
    }))
    return { index: i + 1, weekday, focus: template.focus, isRest: false, exercises: chosen }
  })

  const volumeByGroup = new Map<MuscleGroup, number>()
  for (const day of days) {
    for (const { exercise, sets } of day.exercises) {
      for (const inv of exercise.muscles) {
        const group = muscleIndex.get(inv.muscleId)?.group
        if (!group) continue
        volumeByGroup.set(group, (volumeByGroup.get(group) ?? 0) + sets * (inv.contribution ?? 0))
      }
    }
  }

  return {
    days,
    volumeByGroup,
    recovery: computeRecovery(schedule),
    progression: buildProgressionPlan(params.goal),
  }
}
