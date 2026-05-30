import type { Exercise, MuscleInvolvement } from '../../domain/models/Exercise'
import type { RawExercise, SourceMuscleName } from './source/sourceSchema'
import { MuscleRole } from '../../domain/enums/MuscleRole'
import {
  SOURCE_MUSCLE_TO_ID,
  SOURCE_EQUIPMENT_TO_ENUM,
  SOURCE_MECHANIC_TO_ENUM,
  SOURCE_FORCE_TO_ENUM,
  SOURCE_LEVEL_TO_ENUM,
  SOURCE_CATEGORY_TO_ENUM,
  ROLE_DEFAULT_CONTRIBUTION,
} from './mapping/sourceMuscleMap'

/**
 * Transforms raw `free-exercise-db` records into our immutable `Exercise`
 * entities: maps the source vocabulary to our enums/taxonomy, derives
 * muscle involvements (primary/secondary) with default contributions, and
 * resolves relative image paths against the configured CDN base.
 *
 * Stabilizer involvements are intentionally not invented here — the source
 * has none, and fabricating them would be guesswork. They are a later
 * curation pass (see DATA_MODEL.md).
 */
export class ExerciseNormalizer {
  constructor(private readonly imageBaseUrl: string) {}

  normalizeAll(raws: readonly RawExercise[]): readonly Exercise[] {
    return raws.map((raw) => this.normalize(raw))
  }

  normalize(raw: RawExercise): Exercise {
    return {
      id: raw.id,
      name: raw.name,
      muscles: this.toInvolvements(raw),
      category: SOURCE_CATEGORY_TO_ENUM[raw.category],
      level: SOURCE_LEVEL_TO_ENUM[raw.level],
      equipment: raw.equipment ? SOURCE_EQUIPMENT_TO_ENUM[raw.equipment] : undefined,
      mechanic: raw.mechanic ? SOURCE_MECHANIC_TO_ENUM[raw.mechanic] : undefined,
      force: raw.force ? SOURCE_FORCE_TO_ENUM[raw.force] : undefined,
      instructions: raw.instructions,
      images: raw.images.map((path) => this.resolveImageUrl(path)),
    }
  }

  private toInvolvements(raw: RawExercise): readonly MuscleInvolvement[] {
    return [
      ...raw.primaryMuscles.map((m) => this.involvement(m, MuscleRole.Primary)),
      ...raw.secondaryMuscles.map((m) => this.involvement(m, MuscleRole.Secondary)),
    ]
  }

  private involvement(source: SourceMuscleName, role: MuscleRole): MuscleInvolvement {
    return {
      muscleId: SOURCE_MUSCLE_TO_ID[source],
      role,
      contribution: ROLE_DEFAULT_CONTRIBUTION[role],
    }
  }

  private resolveImageUrl(path: string): string {
    return `${this.imageBaseUrl}${path}`
  }
}
