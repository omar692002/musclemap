import { describe, it, expect } from 'vitest'
import { ApiExerciseRepository } from '../ApiExerciseRepository'
import { ApiMuscleRepository } from '../ApiMuscleRepository'
import type { IExerciseRepository } from '../../../domain/repositories/IExerciseRepository'
import type { IMuscleRepository } from '../../../domain/repositories/IMuscleRepository'
import type { Exercise } from '../../../domain/models/Exercise'
import type { Muscle } from '../../../domain/models/Muscle'
import { MuscleGroup } from '../../../domain/enums/MuscleGroup'
import { ExerciseCategory } from '../../../domain/enums/ExerciseCategory'
import { ExerciseLevel } from '../../../domain/enums/ExerciseLevel'
import { MuscleRole } from '../../../domain/enums/MuscleRole'

/**
 * With no `VITE_API_BASE_URL` in the test env the catalogue API is disabled, so
 * the dual-path repositories must transparently serve the bundled static
 * fallback (and never reject — the loader hook has no catch).
 */
const muscle: Muscle = { id: 'pectoralis-major', name: 'Pectoralis Major', group: MuscleGroup.Chest }
const exercise: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  muscles: [{ muscleId: 'pectoralis-major', role: MuscleRole.Primary, contribution: 1 }],
  category: ExerciseCategory.Strength,
  level: ExerciseLevel.Beginner,
  instructions: ['press'],
  media: [],
}

const exerciseFallback: IExerciseRepository = {
  getAll: async () => [exercise],
  getById: async (id) => (id === exercise.id ? exercise : null),
  findByMuscleGroup: async () => [exercise],
}

const muscleFallback: IMuscleRepository = {
  getAll: async () => [muscle],
  getById: async (id) => (id === muscle.id ? muscle : null),
  findByGroup: async () => [muscle],
}

describe('Api repositories (dual-path, backend disabled in test env)', () => {
  const index = new Map([[muscle.id, muscle.group]])
  const exercises = new ApiExerciseRepository(exerciseFallback, index)
  const muscles = new ApiMuscleRepository(muscleFallback)

  it('falls back to the static exercise dataset', async () => {
    expect(await exercises.getAll()).toEqual([exercise])
    expect(await exercises.getById('bench')).toEqual(exercise)
    expect(await exercises.getById('nope')).toBeNull()
    expect(await exercises.findByMuscleGroup(MuscleGroup.Chest)).toEqual([exercise])
    expect(await exercises.findByMuscleGroup(MuscleGroup.Back)).toEqual([])
  })

  it('falls back to the static muscle taxonomy', async () => {
    expect(await muscles.getAll()).toEqual([muscle])
    expect(await muscles.getById('pectoralis-major')).toEqual(muscle)
    expect(await muscles.findByGroup(MuscleGroup.Chest)).toEqual([muscle])
  })
})
