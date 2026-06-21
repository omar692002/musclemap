import { describe, it, expect } from 'vitest'
import { exerciseRepository, muscleRepository } from '../repositoryFactory'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'

describe('static repositories (normalised dataset)', () => {
  it('getAll returns the full normalised dataset', async () => {
    const exercises = await exerciseRepository.getAll()
    expect(exercises.length).toBe(873)
  })

  it('getById returns a known, fully-normalised exercise', async () => {
    const exercise = await exerciseRepository.getById('3_4_Sit-Up')

    expect(exercise).not.toBeNull()
    expect(exercise?.name).toBe('3/4 Sit-Up')
    expect(exercise?.muscles.length).toBeGreaterThan(0)
    // Media is video-first (a bare YouTube id), then CDN-resolved images.
    expect(exercise?.media[0]?.url).toMatch(/^[A-Za-z0-9_-]{11}$/)
    expect(exercise?.media[1]?.url).toContain('https://')
  })

  it('findByMuscleGroup resolves involvements through the taxonomy', async () => {
    const chest = await exerciseRepository.findByMuscleGroup(MuscleGroup.Chest)
    expect(chest.length).toBeGreaterThan(0)
  })

  it('exposes the full muscle taxonomy', async () => {
    const muscles = await muscleRepository.getAll()
    expect(muscles.length).toBe(17)
  })
})
