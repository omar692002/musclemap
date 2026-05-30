import type { Exercise } from '../models/Exercise'
import type { MuscleGroup } from '../enums/MuscleGroup'

/**
 * Abstraction over exercise data access (Dependency Inversion).
 * The UI depends on this interface, never on a concrete source — so the
 * static-JSON implementation (M1) can be swapped for a Supabase-backed
 * one (T1) with zero UI changes.
 */
export interface IExerciseRepository {
  getAll(): Promise<readonly Exercise[]>
  getById(id: string): Promise<Exercise | null>
  findByMuscleGroup(group: MuscleGroup): Promise<readonly Exercise[]>
}
