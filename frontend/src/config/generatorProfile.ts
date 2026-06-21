import { SplitType } from '../domain/enums/SplitType'
import { TrainingGoal } from '../domain/enums/TrainingGoal'
import { ProfileGoal } from '../domain/enums/ProfileGoal'
import type { Equipment } from '../domain/enums/Equipment'
import type { UserProfile } from '../domain/models/UserProfile'
import { ProgramConfig } from './program.config'

/**
 * Maps an onboarding profile (EM3) to sensible generator inputs (EM5), so a
 * signed-in, onboarded user lands on a split/days/goal/equipment tuned to them
 * instead of the static defaults. Pure — the page still lets them tweak everything.
 */
export interface GeneratorPrefill {
  readonly split: SplitType
  readonly days: number
  readonly goal: TrainingGoal
  readonly equipment: ReadonlySet<Equipment>
}

/** The onboarding goal (why they train) → the generator's set/rep emphasis. */
const GOAL_BY_PROFILE_GOAL: Readonly<Record<ProfileGoal, TrainingGoal>> = {
  [ProfileGoal.BuildMuscle]: TrainingGoal.Hypertrophy,
  [ProfileGoal.GainStrength]: TrainingGoal.Strength,
  [ProfileGoal.LoseFat]: TrainingGoal.Endurance,
  [ProfileGoal.ImproveEndurance]: TrainingGoal.Endurance,
  [ProfileGoal.GeneralFitness]: TrainingGoal.Hypertrophy,
}

const DAY_OPTIONS = ProgramConfig.dayOptions
const MIN_DAYS = DAY_OPTIONS[0]
const MAX_DAYS = DAY_OPTIONS[DAY_OPTIONS.length - 1]

/** Clamp a desired weekly frequency into the supported day-count range. */
function clampDays(frequency: number | null): number {
  if (frequency == null) return ProgramConfig.defaultDays
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(frequency)))
}

/** The split that best fits a given weekly frequency. */
function splitForDays(days: number): SplitType {
  if (days <= 3) return SplitType.FullBody
  if (days === 4) return SplitType.UpperLower
  return SplitType.PushPullLegs
}

export const DEFAULT_PREFILL: GeneratorPrefill = {
  split: ProgramConfig.defaultSplit,
  days: ProgramConfig.defaultDays,
  goal: ProgramConfig.defaultGoal,
  equipment: new Set(),
}

/**
 * Derives generator inputs from the profile. Falls back to {@link DEFAULT_PREFILL}
 * when there is no onboarded profile (signed out, or the static deploy).
 */
export function prefillFromProfile(profile: UserProfile | null): GeneratorPrefill {
  if (!profile || !profile.onboardingCompleted) return DEFAULT_PREFILL
  const days = clampDays(profile.weeklyFrequency)
  return {
    days,
    split: splitForDays(days),
    goal: profile.trainingGoal ? GOAL_BY_PROFILE_GOAL[profile.trainingGoal] : ProgramConfig.defaultGoal,
    equipment: new Set(profile.availableEquipment),
  }
}
