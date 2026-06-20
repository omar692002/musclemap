import type { Exercise } from './Exercise'
import type { MuscleGroup } from '../enums/MuscleGroup'
import type { DayFocus } from '../enums/DayFocus'
import type { Weekday } from '../enums/Weekday'
import type { OverloadCue } from '../enums/OverloadCue'
import type { RecoveryStatus } from '../enums/RecoveryStatus'
import type { ProgressionStrategy } from '../enums/ProgressionStrategy'
import type { ProgressionStep } from '../enums/ProgressionStep'

/** One exercise slotted into a workout, with its prescribed sets and rep range. */
export interface ProgramExercise {
  readonly exercise: Exercise
  readonly sets: number
  /** Target rep range for the prescribed sets, e.g. "6–10". */
  readonly reps: string
  /** Goal-aware progressive-overload cue (EM5). Absent on conditioning work. */
  readonly overload?: OverloadCue
}

/**
 * A single day in the weekly layout: its calendar slot, weekday, focus and
 * exercises. Rest days carry {@link DayFocus.Rest}, `isRest = true` and no
 * exercises so the week reflects real recovery spacing (EM5).
 */
export interface WorkoutDay {
  readonly index: number
  readonly weekday: Weekday
  readonly focus: DayFocus
  readonly isRest: boolean
  readonly exercises: readonly ProgramExercise[]
}

/** How a muscle group recovers across its weekly sessions (EM5). */
export interface GroupRecovery {
  readonly group: MuscleGroup
  readonly sessionsPerWeek: number
  /** Smallest calendar gap (in days) between two sessions training this group. */
  readonly minGapDays: number
  readonly status: RecoveryStatus
}

/** One week's instruction in the progression plan (EM5). */
export interface ProgressionWeek {
  readonly week: number
  readonly step: ProgressionStep
}

/** The 4-week progressive-overload plan for a generated program (EM5). */
export interface ProgressionPlan {
  readonly strategy: ProgressionStrategy
  readonly weeks: readonly ProgressionWeek[]
}

/**
 * A generated week of training: the Mon→Sun layout (training + rest days), the
 * weekly effective-sets-per-group readout, the per-group recovery analysis and
 * the multi-week progression plan (EM5).
 */
export interface WorkoutProgram {
  readonly days: readonly WorkoutDay[]
  readonly volumeByGroup: ReadonlyMap<MuscleGroup, number>
  readonly recovery: readonly GroupRecovery[]
  readonly progression: ProgressionPlan
}
