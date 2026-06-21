import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository'
import type { Exercise } from '../../domain/models/Exercise'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'

/**
 * Reads exercises bundled with the app (static, offline-first).
 * Populated in M1 by normalising the free-exercise-db dataset. Group
 * filtering is resolved through a muscleId -> group index supplied at
 * construction (built from the muscle taxonomy), keeping this repository
 * free of any direct taxonomy dependency.
 */
export class StaticExerciseRepository implements IExerciseRepository {
  constructor(
    private readonly exercises: readonly Exercise[] = [],
    private readonly muscleGroupIndex: ReadonlyMap<string, MuscleGroup> = new Map(),
  ) {}

  async getAll(): Promise<readonly Exercise[]> {
    return this.exercises
  }

  async getById(id: string): Promise<Exercise | null> {
    return this.exercises.find((exercise) => exercise.id === id) ?? null
  }

  async findByMuscleGroup(group: MuscleGroup): Promise<readonly Exercise[]> {
    return this.exercises.filter((exercise) =>
      exercise.muscles.some(
        (involvement) => this.muscleGroupIndex.get(involvement.muscleId) === group,
      ),
    )
  }
}
