import { describe, it, expect } from 'vitest'
import type { Exercise } from '../../../domain/models/Exercise'
import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleHeadId } from '../../../domain/enums/MuscleHeadId'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { ExerciseCategory } from '../../../domain/enums/ExerciseCategory'
import { ExerciseLevel } from '../../../domain/enums/ExerciseLevel'
import { highlightHeadsFromExercise } from '../highlight'

function ex(name: string, muscles: { muscleId: MuscleId; role: MuscleRole }[]): Exercise {
  return {
    id: name,
    name,
    muscles,
    category: ExerciseCategory.Strength,
    level: ExerciseLevel.Beginner,
    instructions: [],
    media: [],
  }
}

describe('highlightHeadsFromExercise', () => {
  it('keys a headed muscle by its emphasised head only', () => {
    const highlight = highlightHeadsFromExercise(
      ex('Dumbbell Lateral Raise', [{ muscleId: MuscleId.Deltoid, role: MuscleRole.Primary }]),
    )
    expect(highlight.get(MuscleHeadId.DeltoidLateral)).toBe(MuscleRole.Primary)
    expect(highlight.has(MuscleHeadId.DeltoidAnterior)).toBe(false)
    // The whole-muscle id is never used as a key for a headed muscle.
    expect(highlight.has(MuscleId.Deltoid)).toBe(false)
  })

  it('keys a non-headed muscle by its muscle id', () => {
    const highlight = highlightHeadsFromExercise(
      ex('Lat Pulldown', [{ muscleId: MuscleId.LatissimusDorsi, role: MuscleRole.Primary }]),
    )
    expect(highlight.get(MuscleId.LatissimusDorsi)).toBe(MuscleRole.Primary)
  })

  it('keeps the strongest role when a head is hit by two involvements', () => {
    const highlight = highlightHeadsFromExercise(
      ex('Overhead Press', [
        { muscleId: MuscleId.Deltoid, role: MuscleRole.Secondary },
        { muscleId: MuscleId.Deltoid, role: MuscleRole.Primary },
      ]),
    )
    expect(highlight.get(MuscleHeadId.DeltoidAnterior)).toBe(MuscleRole.Primary)
  })
})
