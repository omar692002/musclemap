import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository'
import type { Exercise } from '../../domain/models/Exercise'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { fetchCatalogExercises } from './catalogApi'

/**
 * Exercise repository backed by the catalogue API, with the bundled
 * {@link StaticExerciseRepository} as a transparent fallback (dual-path): when a
 * backend is configured the data comes from `/catalog/exercises`, otherwise — or
 * if the request fails — the bundled dataset is used, so the static GitHub-Pages
 * deploy and offline use keep working unchanged.
 *
 * Group filtering and by-id lookups resolve from the loaded list (the UI loads
 * the full catalogue once anyway), reusing the same muscleId→group index the
 * static repository uses.
 */
export class ApiExerciseRepository implements IExerciseRepository {
  constructor(
    private readonly fallback: IExerciseRepository,
    private readonly muscleGroupIndex: ReadonlyMap<string, MuscleGroup>,
  ) {}

  private async load(): Promise<readonly Exercise[]> {
    return (await fetchCatalogExercises()) ?? this.fallback.getAll()
  }

  async getAll(): Promise<readonly Exercise[]> {
    return this.load()
  }

  async getById(id: string): Promise<Exercise | null> {
    return (await this.load()).find((exercise) => exercise.id === id) ?? null
  }

  async findByMuscleGroup(group: MuscleGroup): Promise<readonly Exercise[]> {
    return (await this.load()).filter((exercise) =>
      exercise.muscles.some(
        (involvement) => this.muscleGroupIndex.get(involvement.muscleId) === group,
      ),
    )
  }
}
