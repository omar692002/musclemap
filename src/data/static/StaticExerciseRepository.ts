import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository'
import type { Exercise } from '../../domain/models/Exercise'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'

/**
 * Reads exercises bundled with the app (static, offline-first).
 * M0 stub: returns no data yet — the curated dataset is imported and
 * normalised in M1. Behaviour is correct and side-effect free so the
 * UI can already be wired against the IExerciseRepository contract.
 */
export class StaticExerciseRepository implements IExerciseRepository {
  private readonly exercises: readonly Exercise[]

  constructor(exercises: readonly Exercise[] = []) {
    this.exercises = exercises
  }

  async getAll(): Promise<readonly Exercise[]> {
    return this.exercises
  }

  async getById(id: string): Promise<Exercise | null> {
    return this.exercises.find((exercise) => exercise.id === id) ?? null
  }

  async findByMuscleGroup(_group: MuscleGroup): Promise<readonly Exercise[]> {
    // Muscle→group resolution is added in M1 alongside the Muscle dataset.
    return []
  }
}
