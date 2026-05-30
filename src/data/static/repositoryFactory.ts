import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository'
import type { IMuscleRepository } from '../../domain/repositories/IMuscleRepository'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { DataSourceConfig } from '../../config/dataSource.config'
import { RAW_EXERCISES } from './source/rawExercises'
import { MUSCLES } from './taxonomy/muscles'
import { ExerciseNormalizer } from './ExerciseNormalizer'
import { StaticExerciseRepository } from './StaticExerciseRepository'
import { StaticMuscleRepository } from './StaticMuscleRepository'

/**
 * Composition root for the static data layer. Normalises the bundled
 * dataset once and wires the repositories the UI depends on (through their
 * interfaces). Swapping in a remote implementation later happens here only.
 */
function buildMuscleGroupIndex(muscles: readonly Muscle[]): ReadonlyMap<string, MuscleGroup> {
  return new Map(muscles.map((muscle) => [muscle.id, muscle.group]))
}

const normalizer = new ExerciseNormalizer(DataSourceConfig.exerciseImageBaseUrl)
const exercises = normalizer.normalizeAll(RAW_EXERCISES)

export const muscleRepository: IMuscleRepository = new StaticMuscleRepository(MUSCLES)

export const exerciseRepository: IExerciseRepository = new StaticExerciseRepository(
  exercises,
  buildMuscleGroupIndex(MUSCLES),
)
