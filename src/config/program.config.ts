import { SplitType } from '../domain/enums/SplitType'
import { MuscleGroup } from '../domain/enums/MuscleGroup'
import { TrainingGoal } from '../domain/enums/TrainingGoal'

/** A day template: a focus label and the muscle groups it targets. */
export interface DayTemplate {
  readonly label: string
  readonly groups: readonly MuscleGroup[]
}

const PUSH: DayTemplate = { label: 'Push', groups: [MuscleGroup.Chest, MuscleGroup.Shoulders, MuscleGroup.Triceps] }
const PULL: DayTemplate = { label: 'Pull', groups: [MuscleGroup.Back, MuscleGroup.Biceps, MuscleGroup.Forearms] }
const LEGS: DayTemplate = {
  label: 'Legs',
  groups: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Calves],
}
const UPPER: DayTemplate = {
  label: 'Upper',
  groups: [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Shoulders, MuscleGroup.Biceps, MuscleGroup.Triceps],
}
const LOWER: DayTemplate = {
  label: 'Lower',
  groups: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Calves],
}
const FULL_BODY: DayTemplate = {
  label: 'Full body',
  groups: [
    MuscleGroup.Chest,
    MuscleGroup.Back,
    MuscleGroup.Shoulders,
    MuscleGroup.Quadriceps,
    MuscleGroup.Hamstrings,
    MuscleGroup.Core,
  ],
}

/** The repeating day cycle for each split; filled out to the chosen day count. */
export const SPLIT_PATTERNS: Readonly<Record<SplitType, readonly DayTemplate[]>> = {
  [SplitType.FullBody]: [FULL_BODY],
  [SplitType.UpperLower]: [UPPER, LOWER],
  [SplitType.PushPullLegs]: [PUSH, PULL, LEGS],
}

/** A prescription: how many sets and what rep range for one exercise. */
export interface SetScheme {
  readonly sets: number
  readonly repRange: string
}

/**
 * Set/rep prescriptions per goal, split by exercise mechanic (heavy compounds
 * get fewer reps than isolation accessories). Centralised so the generator
 * carries no hardcoded numbers.
 */
export const GOAL_SCHEMES: Readonly<Record<TrainingGoal, { compound: SetScheme; isolation: SetScheme }>> = {
  [TrainingGoal.Strength]: {
    compound: { sets: 5, repRange: '3–5' },
    isolation: { sets: 3, repRange: '6–8' },
  },
  [TrainingGoal.Hypertrophy]: {
    compound: { sets: 4, repRange: '6–10' },
    isolation: { sets: 3, repRange: '10–15' },
  },
  [TrainingGoal.Endurance]: {
    compound: { sets: 3, repRange: '12–15' },
    isolation: { sets: 2, repRange: '15–20' },
  },
}

export const ProgramConfig = {
  exercisesPerGroup: 1,
  dayOptions: [2, 3, 4, 5, 6] as const,
  defaultDays: 3,
  defaultSplit: SplitType.PushPullLegs,
  defaultGoal: TrainingGoal.Hypertrophy,
} as const
