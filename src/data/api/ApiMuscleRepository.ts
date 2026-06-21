import type { IMuscleRepository } from '../../domain/repositories/IMuscleRepository'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import { fetchCatalogMuscles } from './catalogApi'

/**
 * Muscle-taxonomy repository backed by the catalogue API, with the bundled
 * {@link StaticMuscleRepository} as a transparent fallback (dual-path) — same
 * pattern as {@link ApiExerciseRepository}.
 */
export class ApiMuscleRepository implements IMuscleRepository {
  constructor(private readonly fallback: IMuscleRepository) {}

  private async load(): Promise<readonly Muscle[]> {
    return (await fetchCatalogMuscles()) ?? this.fallback.getAll()
  }

  async getAll(): Promise<readonly Muscle[]> {
    return this.load()
  }

  async getById(id: string): Promise<Muscle | null> {
    return (await this.load()).find((muscle) => muscle.id === id) ?? null
  }

  async findByGroup(group: MuscleGroup): Promise<readonly Muscle[]> {
    return (await this.load()).filter((muscle) => muscle.group === group)
  }
}
