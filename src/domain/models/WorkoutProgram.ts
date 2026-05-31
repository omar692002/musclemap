import type { Exercise } from './Exercise'
import type { MuscleGroup } from '../enums/MuscleGroup'

/** One exercise slotted into a workout, with its prescribed sets and rep range. */
export interface ProgramExercise {
  readonly exercise: Exercise
  readonly sets: number
  /** Target rep range for the prescribed sets, e.g. "6–10". */
  readonly reps: string
}

/** A single training day: a focus label and its chosen exercises. */
export interface WorkoutDay {
  readonly label: string
  readonly focus: string
  readonly exercises: readonly ProgramExercise[]
}

/** A generated week of training plus its weekly effective-sets-per-group readout. */
export interface WorkoutProgram {
  readonly days: readonly WorkoutDay[]
  readonly volumeByGroup: ReadonlyMap<MuscleGroup, number>
}
