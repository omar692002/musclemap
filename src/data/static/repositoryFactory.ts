import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository'
import type { IMuscleRepository } from '../../domain/repositories/IMuscleRepository'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { DataSourceConfig } from '../../config/dataSource.config'
import { isBackendAuthEnabled } from '../../config/auth.config'
import { RAW_EXERCISES } from './source/rawExercises'
import { MUSCLES } from './taxonomy/muscles'
import { ExerciseNormalizer } from './ExerciseNormalizer'
import { StaticExerciseRepository } from './StaticExerciseRepository'
import { StaticMuscleRepository } from './StaticMuscleRepository'
import { ApiExerciseRepository } from '../api/ApiExerciseRepository'
import { ApiMuscleRepository } from '../api/ApiMuscleRepository'

/**
 * Composition root for the data layer. Normalises the bundled dataset once and
 * wires the repositories the UI depends on (through their interfaces).
 *
 * When a backend is configured (`VITE_API_BASE_URL`) the API-backed repositories
 * are used, with the bundled static repositories as a transparent fallback
 * (dual-path); otherwise the static repositories serve directly so the
 * offline / GitHub-Pages deploy keeps working with no backend.
 */
function buildMuscleGroupIndex(muscles: readonly Muscle[]): ReadonlyMap<string, MuscleGroup> {
  return new Map(muscles.map((muscle) => [muscle.id, muscle.group]))
}

const normalizer = new ExerciseNormalizer(DataSourceConfig.exerciseImageBaseUrl)
const exercises = normalizer.normalizeAll(RAW_EXERCISES)
const muscleGroupIndex = buildMuscleGroupIndex(MUSCLES)

const staticMuscleRepository: IMuscleRepository = new StaticMuscleRepository(MUSCLES)
const staticExerciseRepository: IExerciseRepository = new StaticExerciseRepository(
  exercises,
  muscleGroupIndex,
)

export const muscleRepository: IMuscleRepository = isBackendAuthEnabled()
  ? new ApiMuscleRepository(staticMuscleRepository)
  : staticMuscleRepository

export const exerciseRepository: IExerciseRepository = isBackendAuthEnabled()
  ? new ApiExerciseRepository(staticExerciseRepository, muscleGroupIndex)
  : staticExerciseRepository
