import type { MuscleGroup } from '../enums/MuscleGroup'

/**
 * A single muscle (and, in M1, its specific head when applicable).
 * Immutable domain entity.
 */
export interface Muscle {
  readonly id: string
  readonly name: string
  readonly group: MuscleGroup
  /** Optional head name, e.g. "anterior" for the anterior deltoid. Set in M1. */
  readonly head?: string
}
