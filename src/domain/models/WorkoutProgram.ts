import type { Exercise } from './Exercise'
import type { MuscleGroup } from '../enums/MuscleGroup'
import type { DayFocus } from '../enums/DayFocus'

/** One exercise slotted into a workout, with its prescribed sets and rep range. */
export interface ProgramExercise {
  readonly exercise: Exercise
  readonly sets: number
  /** Target rep range for the prescribed sets, e.g. "6–10". */
  readonly reps: string
}

/** A single training day: its number, focus (translation key), and exercises. */
export interface WorkoutDay {
  readonly index: number
  readonly focus: DayFocus
  readonly exercises: readonly ProgramExercise[]
}

/** A generated week of training plus its weekly effective-sets-per-group readout. */
export interface WorkoutProgram {
  readonly days: readonly WorkoutDay[]
  readonly volumeByGroup: ReadonlyMap<MuscleGroup, number>
}
