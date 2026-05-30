import type { MuscleRole } from '../enums/MuscleRole'
import type { Equipment } from '../enums/Equipment'
import type { ExerciseMechanic } from '../enums/ExerciseMechanic'
import type { ExerciseForce } from '../enums/ExerciseForce'
import type { ExerciseCategory } from '../enums/ExerciseCategory'
import type { ExerciseLevel } from '../enums/ExerciseLevel'
import type { ExerciseMedia } from './ExerciseMedia'

/**
 * Links an exercise to one muscle with the role that muscle plays.
 * `contribution` (0..1) is used later by the program generator to
 * compute weekly volume per muscle. Defaulted by role in M1.
 */
export interface MuscleInvolvement {
  readonly muscleId: string
  readonly role: MuscleRole
  readonly contribution?: number
}

/**
 * An exercise and the muscles it trains. Immutable domain entity.
 * Enriched in M1 with equipment/mechanic/force/category/level, the
 * step-by-step instructions, and resolved image URLs.
 */
export interface Exercise {
  readonly id: string
  readonly name: string
  readonly muscles: readonly MuscleInvolvement[]
  readonly category: ExerciseCategory
  readonly level: ExerciseLevel
  /** Optional in the source data, hence optional here. */
  readonly equipment?: Equipment
  readonly mechanic?: ExerciseMechanic
  readonly force?: ExerciseForce
  readonly instructions: readonly string[]
  /**
   * Images and/or videos for the movement, resolved at normalisation time.
   * Image-or-video aware so future videos are a data swap, not a UI change.
   */
  readonly media: readonly ExerciseMedia[]
}
