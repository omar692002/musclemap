import { describe, it, expect } from 'vitest'
import { recommendedSessionFor } from '../recommendation.config'
import { CARDIO_SESSION_ID, suggestedSessionFor } from '../sessions.config'
import { emptyProfile } from '../../domain/models/UserProfile'
import { ProfileGoal } from '../../domain/enums/ProfileGoal'

const aWednesday = new Date(2024, 0, 3) // 2024-01-03 is a Wednesday.

describe('recommendedSessionFor', () => {
  it('recommends cardio for fat-loss and endurance goals', () => {
    for (const goal of [ProfileGoal.LoseFat, ProfileGoal.ImproveEndurance]) {
      const session = recommendedSessionFor({ ...emptyProfile(), trainingGoal: goal }, aWednesday)
      expect(session.id).toBe(CARDIO_SESSION_ID)
    }
  })

  it('recommends the strength rotation for muscle/strength/general goals', () => {
    for (const goal of [ProfileGoal.BuildMuscle, ProfileGoal.GainStrength, ProfileGoal.GeneralFitness]) {
      const session = recommendedSessionFor({ ...emptyProfile(), trainingGoal: goal }, aWednesday)
      expect(session.id).toBe(suggestedSessionFor(aWednesday).id)
    }
  })

  it('falls back to the rotation when no profile or goal is set', () => {
    const expected = suggestedSessionFor(aWednesday).id
    expect(recommendedSessionFor(null, aWednesday).id).toBe(expected)
    expect(recommendedSessionFor(emptyProfile(), aWednesday).id).toBe(expected)
  })
})
