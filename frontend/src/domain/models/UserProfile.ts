import type { Gender } from '../enums/Gender'
import type { FitnessLevel } from '../enums/FitnessLevel'
import type { ProfileGoal } from '../enums/ProfileGoal'
import type { TrainingExperience } from '../enums/TrainingExperience'
import type { Equipment } from '../enums/Equipment'

/**
 * The user's onboarding / personalization profile (EM3). 1:1 with the signed-in
 * user; persisted to the backend's {@code user_profiles} table when a backend is
 * configured, otherwise cached locally. All fields are optional so the wizard can
 * save partial progress; {@link onboardingCompleted} is derived server-side from
 * whether the core fields are present.
 */
export interface UserProfile {
  readonly age: number | null
  readonly gender: Gender | null
  readonly heightCm: number | null
  readonly weightKg: number | null
  readonly fitnessLevel: FitnessLevel | null
  readonly trainingExperience: TrainingExperience | null
  readonly trainingGoal: ProfileGoal | null
  readonly weeklyFrequency: number | null
  readonly availableEquipment: readonly Equipment[]
  readonly injuryLimitations: string | null
  readonly onboardingCompleted: boolean
  readonly onboardingSkipped: boolean
}

/** A blank profile — the starting point for a user who has not onboarded yet. */
export function emptyProfile(): UserProfile {
  return {
    age: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    fitnessLevel: null,
    trainingExperience: null,
    trainingGoal: null,
    weeklyFrequency: null,
    availableEquipment: [],
    injuryLimitations: null,
    onboardingCompleted: false,
    onboardingSkipped: false,
  }
}
