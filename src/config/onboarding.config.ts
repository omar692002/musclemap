import { Gender } from '../domain/enums/Gender'
import { FitnessLevel } from '../domain/enums/FitnessLevel'
import { ProfileGoal } from '../domain/enums/ProfileGoal'
import { TrainingExperience } from '../domain/enums/TrainingExperience'
import { Equipment } from '../domain/enums/Equipment'

/**
 * The ordered steps of the premium-onboarding wizard (EM3). Centralised so the
 * flow's shape and the option vocabularies live in one place (no magic strings /
 * hardcoded step lists in the component).
 */
export enum OnboardingStep {
  Age = 'AGE',
  Gender = 'GENDER',
  Measurements = 'MEASUREMENTS',
  Level = 'LEVEL',
  Experience = 'EXPERIENCE',
  Goal = 'GOAL',
  Frequency = 'FREQUENCY',
  Equipment = 'EQUIPMENT',
  Injuries = 'INJURIES',
}

/** Wizard order. */
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  OnboardingStep.Age,
  OnboardingStep.Gender,
  OnboardingStep.Measurements,
  OnboardingStep.Level,
  OnboardingStep.Experience,
  OnboardingStep.Goal,
  OnboardingStep.Frequency,
  OnboardingStep.Equipment,
  OnboardingStep.Injuries,
]

/** Steps the user may skip (they don't gate onboarding completion). */
export const SKIPPABLE_STEPS: ReadonlySet<OnboardingStep> = new Set([
  OnboardingStep.Experience,
  OnboardingStep.Equipment,
  OnboardingStep.Injuries,
])

/** Option vocabularies (enum order is the display order). */
export const GENDER_OPTIONS: readonly Gender[] = Object.values(Gender)
export const FITNESS_LEVEL_OPTIONS: readonly FitnessLevel[] = Object.values(FitnessLevel)
export const EXPERIENCE_OPTIONS: readonly TrainingExperience[] = Object.values(TrainingExperience)
export const PROFILE_GOAL_OPTIONS: readonly ProfileGoal[] = Object.values(ProfileGoal)
export const EQUIPMENT_OPTIONS: readonly Equipment[] = Object.values(Equipment)
export const FREQUENCY_OPTIONS: readonly number[] = [1, 2, 3, 4, 5, 6, 7]

/** Numeric input bounds — kept in lockstep with the backend bean-validation. */
export const OnboardingBounds = {
  age: { min: 10, max: 120 },
  heightCm: { min: 50, max: 260 },
  weightKg: { min: 20, max: 400 },
} as const
