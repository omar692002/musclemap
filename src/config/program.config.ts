import { SplitType } from '../domain/enums/SplitType'
import { MuscleGroup } from '../domain/enums/MuscleGroup'
import { TrainingGoal } from '../domain/enums/TrainingGoal'
import { DayFocus } from '../domain/enums/DayFocus'

/** A day template: a focus (translation key) and the muscle groups it targets. */
export interface DayTemplate {
  readonly focus: DayFocus
  readonly groups: readonly MuscleGroup[]
}

const PUSH: DayTemplate = { focus: DayFocus.Push, groups: [MuscleGroup.Chest, MuscleGroup.Shoulders, MuscleGroup.Triceps] }
const PULL: DayTemplate = { focus: DayFocus.Pull, groups: [MuscleGroup.Back, MuscleGroup.Biceps, MuscleGroup.Forearms] }
const LEGS: DayTemplate = {
  focus: DayFocus.Legs,
  groups: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Calves],
}
const CHEST_TRICEPS: DayTemplate = { focus: DayFocus.ChestTriceps, groups: [MuscleGroup.Chest, MuscleGroup.Triceps] }
const BACK_BICEPS: DayTemplate = {
  focus: DayFocus.BackBiceps,
  groups: [MuscleGroup.Back, MuscleGroup.Biceps, MuscleGroup.Forearms],
}
const SHOULDERS_CORE: DayTemplate = {
  focus: DayFocus.ShouldersCore,
  groups: [MuscleGroup.Shoulders, MuscleGroup.Core],
}
const UPPER: DayTemplate = {
  focus: DayFocus.Upper,
  groups: [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Shoulders, MuscleGroup.Biceps, MuscleGroup.Triceps],
}
const LOWER: DayTemplate = {
  focus: DayFocus.Lower,
  groups: [MuscleGroup.Quadriceps, MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.Calves],
}
const FULL_BODY: DayTemplate = {
  focus: DayFocus.FullBody,
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
  [SplitType.BodyPart]: [CHEST_TRICEPS, BACK_BICEPS, LEGS, SHOULDERS_CORE],
}

/** Muscle groups trained by each day focus (the quick-session launcher uses this). */
export const TEMPLATE_BY_FOCUS: Readonly<Record<DayFocus, DayTemplate>> = {
  [DayFocus.Push]: PUSH,
  [DayFocus.Pull]: PULL,
  [DayFocus.Legs]: LEGS,
  [DayFocus.Upper]: UPPER,
  [DayFocus.Lower]: LOWER,
  [DayFocus.FullBody]: FULL_BODY,
  [DayFocus.ChestTriceps]: CHEST_TRICEPS,
  [DayFocus.BackBiceps]: BACK_BICEPS,
  [DayFocus.ShouldersCore]: SHOULDERS_CORE,
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
