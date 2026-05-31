import { SplitType } from '../domain/enums/SplitType'
import { MuscleGroup } from '../domain/enums/MuscleGroup'

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

export const ProgramConfig = {
  setsPerExercise: 3,
  exercisesPerGroup: 1,
  dayOptions: [2, 3, 4, 5, 6] as const,
  defaultDays: 3,
  defaultSplit: SplitType.PushPullLegs,
} as const
