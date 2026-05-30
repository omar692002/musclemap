import type { MuscleRole } from '../enums/MuscleRole'

/**
 * Links an exercise to one muscle with the role that muscle plays.
 * `contribution` (0..1) is used later by the program generator to
 * compute weekly volume per muscle. Defaulted/refined in M1+.
 */
export interface MuscleInvolvement {
  readonly muscleId: string
  readonly role: MuscleRole
  readonly contribution?: number
}

/**
 * An exercise and the muscles it trains. Immutable domain entity.
 */
export interface Exercise {
  readonly id: string
  readonly name: string
  readonly muscles: readonly MuscleInvolvement[]
}
