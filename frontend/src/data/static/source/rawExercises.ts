import rawExercisesJson from './exercises.json'
import type { RawExercise } from './sourceSchema'

/**
 * The bundled `free-exercise-db` dataset, typed as our raw source shape.
 * The single cast is isolated here so the rest of the data layer works
 * against the typed `RawExercise` contract.
 */
export const RAW_EXERCISES = rawExercisesJson as unknown as readonly RawExercise[]
