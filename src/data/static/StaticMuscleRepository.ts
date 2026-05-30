import type { IMuscleRepository } from '../../domain/repositories/IMuscleRepository'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'

/**
 * Serves the bundled muscle taxonomy (static, offline-first).
 * Implements IMuscleRepository so a remote source can replace it later
 * with zero UI change.
 */
export class StaticMuscleRepository implements IMuscleRepository {
  constructor(private readonly muscles: readonly Muscle[] = []) {}

  async getAll(): Promise<readonly Muscle[]> {
    return this.muscles
  }

  async getById(id: string): Promise<Muscle | null> {
    return this.muscles.find((muscle) => muscle.id === id) ?? null
  }

  async findByGroup(group: MuscleGroup): Promise<readonly Muscle[]> {
    return this.muscles.filter((muscle) => muscle.group === group)
  }
}
