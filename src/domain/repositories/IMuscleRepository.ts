import type { Muscle } from '../models/Muscle'
import type { MuscleGroup } from '../enums/MuscleGroup'

/**
 * Abstraction over muscle-taxonomy access (Dependency Inversion).
 * Backs the muscle map (M3) and group filtering. Mirrors the exercise
 * seam: the static catalog now can be swapped for a remote source later
 * without touching the UI.
 */
export interface IMuscleRepository {
  getAll(): Promise<readonly Muscle[]>
  getById(id: string): Promise<Muscle | null>
  findByGroup(group: MuscleGroup): Promise<readonly Muscle[]>
}
