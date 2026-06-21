import { describe, it, expect } from 'vitest'
import type { Exercise } from '../../../domain/models/Exercise'
import { MuscleId } from '../../../domain/enums/MuscleId'
import { MuscleHeadId } from '../../../domain/enums/MuscleHeadId'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { ExerciseCategory } from '../../../domain/enums/ExerciseCategory'
import { ExerciseLevel } from '../../../domain/enums/ExerciseLevel'
import { headsOf, exerciseInvolvesHead } from '../headAttribution'

function ex(name: string, muscleIds: MuscleId[]): Exercise {
  return {
    id: name,
    name,
    muscles: muscleIds.map((muscleId) => ({ muscleId, role: MuscleRole.Primary })),
    category: ExerciseCategory.Strength,
    level: ExerciseLevel.Beginner,
    instructions: [],
    media: [],
  }
}

describe('head attribution', () => {
  it('lateral raise → lateral deltoid only', () => {
    const heads = headsOf(ex('Dumbbell Lateral Raise', [MuscleId.Deltoid]))
    expect(heads.has(MuscleHeadId.DeltoidLateral)).toBe(true)
    expect(heads.has(MuscleHeadId.DeltoidAnterior)).toBe(false)
    expect(heads.has(MuscleHeadId.DeltoidPosterior)).toBe(false)
  })

  it('overhead press → anterior + lateral deltoid', () => {
    const heads = [...headsOf(ex('Barbell Overhead Press', [MuscleId.Deltoid])).keys()].sort()
    expect(heads).toEqual([MuscleHeadId.DeltoidAnterior, MuscleHeadId.DeltoidLateral].sort())
  })

  it('rear delt fly → posterior deltoid', () => {
    expect(
      exerciseInvolvesHead(ex('Rear Delt Reverse Fly', [MuscleId.Deltoid]), MuscleHeadId.DeltoidPosterior),
    ).toBe(true)
  })

  it('incline press → upper chest; flat press → mid chest', () => {
    expect(headsOf(ex('Incline Dumbbell Press', [MuscleId.PectoralisMajor])).has(MuscleHeadId.PecUpper)).toBe(true)
    expect([...headsOf(ex('Barbell Bench Press', [MuscleId.PectoralisMajor])).keys()]).toEqual([
      MuscleHeadId.PecMid,
    ])
  })

  it('seated calf raise → soleus, standing → gastrocnemius', () => {
    expect(headsOf(ex('Seated Calf Raise', [MuscleId.Calves])).has(MuscleHeadId.CalfSoleus)).toBe(true)
    expect(headsOf(ex('Standing Calf Raise', [MuscleId.Calves])).has(MuscleHeadId.CalfGastrocnemius)).toBe(true)
  })

  it('headless muscles produce no heads', () => {
    expect(headsOf(ex('Wrist Curl', [MuscleId.Forearms])).size).toBe(0)
  })
})
