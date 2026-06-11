import { describe, it, expect } from 'vitest'
import { ExerciseNormalizer } from '../ExerciseNormalizer'
import type { RawExercise } from '../source/sourceSchema'
import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { Equipment } from '../../../domain/enums/Equipment'
import { ExerciseCategory } from '../../../domain/enums/ExerciseCategory'
import { ExerciseLevel } from '../../../domain/enums/ExerciseLevel'
import { ExerciseMechanic } from '../../../domain/enums/ExerciseMechanic'
import { ExerciseForce } from '../../../domain/enums/ExerciseForce'
import { MediaKind } from '../../../domain/enums/MediaKind'
import { MediaSource } from '../../../domain/enums/MediaSource'

const IMAGE_BASE = 'https://cdn.example/'

const sample: RawExercise = {
  id: '3_4_Sit-Up',
  name: '3/4 Sit-Up',
  force: 'pull',
  level: 'beginner',
  mechanic: 'compound',
  equipment: 'body only',
  primaryMuscles: ['abdominals'],
  secondaryMuscles: ['lower back'],
  instructions: ['Lie down.', 'Sit up.'],
  category: 'strength',
  images: ['3_4_Sit-Up/0.jpg', '3_4_Sit-Up/1.jpg'],
}

describe('ExerciseNormalizer', () => {
  const normalizer = new ExerciseNormalizer(IMAGE_BASE)

  it('maps source muscles to taxonomy ids with role + default contribution', () => {
    const exercise = normalizer.normalize(sample)

    expect(exercise.muscles).toEqual([
      { muscleId: MuscleId.RectusAbdominis, role: MuscleRole.Primary, contribution: 1 },
      { muscleId: MuscleId.ErectorSpinae, role: MuscleRole.Secondary, contribution: 0.5 },
    ])
  })

  it('translates source attributes into domain enums', () => {
    const exercise = normalizer.normalize(sample)

    expect(exercise.category).toBe(ExerciseCategory.Strength)
    expect(exercise.level).toBe(ExerciseLevel.Beginner)
    expect(exercise.equipment).toBe(Equipment.Bodyweight)
    expect(exercise.mechanic).toBe(ExerciseMechanic.Compound)
    expect(exercise.force).toBe(ExerciseForce.Pull)
  })

  it('prepends the curated video, then the images resolved against the base url', () => {
    const exercise = normalizer.normalize(sample)

    // Every catalog exercise has a curated YouTube demo (exerciseVideos.ts).
    expect(exercise.media[0]?.kind).toBe(MediaKind.Video)
    expect(exercise.media[0]?.source).toBe(MediaSource.YouTube)
    expect(exercise.media[0]?.url).toMatch(/^[A-Za-z0-9_-]{11}$/)
    expect(exercise.media.slice(1)).toEqual([
      { kind: MediaKind.Image, source: MediaSource.File, url: 'https://cdn.example/3_4_Sit-Up/0.jpg' },
      { kind: MediaKind.Image, source: MediaSource.File, url: 'https://cdn.example/3_4_Sit-Up/1.jpg' },
    ])
  })

  it('leaves optional attributes undefined when the source omits them', () => {
    const exercise = normalizer.normalize({
      ...sample,
      equipment: null,
      mechanic: null,
      force: null,
    })

    expect(exercise.equipment).toBeUndefined()
    expect(exercise.mechanic).toBeUndefined()
    expect(exercise.force).toBeUndefined()
  })
})
