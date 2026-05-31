import { MuscleGroup } from '../domain/enums/MuscleGroup'
import { Equipment } from '../domain/enums/Equipment'
import { MuscleRole } from '../domain/enums/MuscleRole'
import { ExerciseLevel } from '../domain/enums/ExerciseLevel'
import { ExerciseMechanic } from '../domain/enums/ExerciseMechanic'
import { ExerciseForce } from '../domain/enums/ExerciseForce'
import { ExerciseCategory } from '../domain/enums/ExerciseCategory'
import { BodyView } from '../domain/enums/BodyView'
import { SplitType } from '../domain/enums/SplitType'
import { TrainingGoal } from '../domain/enums/TrainingGoal'

/**
 * Human-readable labels for enum values, and static UI copy.
 * Centralised so the UI never hardcodes display strings (project rule).
 */

export const MUSCLE_GROUP_LABELS: Readonly<Record<MuscleGroup, string>> = {
  [MuscleGroup.Chest]: 'Chest',
  [MuscleGroup.Back]: 'Back',
  [MuscleGroup.Shoulders]: 'Shoulders',
  [MuscleGroup.Biceps]: 'Biceps',
  [MuscleGroup.Triceps]: 'Triceps',
  [MuscleGroup.Forearms]: 'Forearms',
  [MuscleGroup.Core]: 'Core',
  [MuscleGroup.Quadriceps]: 'Quadriceps',
  [MuscleGroup.Hamstrings]: 'Hamstrings',
  [MuscleGroup.Glutes]: 'Glutes',
  [MuscleGroup.Calves]: 'Calves',
  [MuscleGroup.Neck]: 'Neck',
  [MuscleGroup.Adductors]: 'Adductors',
  [MuscleGroup.Abductors]: 'Abductors',
}

export const EQUIPMENT_LABELS: Readonly<Record<Equipment, string>> = {
  [Equipment.Bands]: 'Bands',
  [Equipment.Barbell]: 'Barbell',
  [Equipment.Bodyweight]: 'Bodyweight',
  [Equipment.Cable]: 'Cable',
  [Equipment.Dumbbell]: 'Dumbbell',
  [Equipment.EzCurlBar]: 'EZ Curl Bar',
  [Equipment.ExerciseBall]: 'Exercise Ball',
  [Equipment.FoamRoll]: 'Foam Roll',
  [Equipment.Kettlebell]: 'Kettlebell',
  [Equipment.Machine]: 'Machine',
  [Equipment.MedicineBall]: 'Medicine Ball',
  [Equipment.Other]: 'Other',
}

export const MUSCLE_ROLE_LABELS: Readonly<Record<MuscleRole, string>> = {
  [MuscleRole.Primary]: 'Primary',
  [MuscleRole.Secondary]: 'Secondary',
  [MuscleRole.Stabilizer]: 'Stabilizer',
}

export const BODY_VIEW_LABELS: Readonly<Record<BodyView, string>> = {
  [BodyView.Front]: 'Front',
  [BodyView.Back]: 'Back',
}

export const SPLIT_LABELS: Readonly<Record<SplitType, string>> = {
  [SplitType.FullBody]: 'Full body',
  [SplitType.UpperLower]: 'Upper / Lower',
  [SplitType.PushPullLegs]: 'Push / Pull / Legs',
}

export const GOAL_LABELS: Readonly<Record<TrainingGoal, string>> = {
  [TrainingGoal.Strength]: 'Strength',
  [TrainingGoal.Hypertrophy]: 'Hypertrophy',
  [TrainingGoal.Endurance]: 'Endurance',
}

export const EXERCISE_LEVEL_LABELS: Readonly<Record<ExerciseLevel, string>> = {
  [ExerciseLevel.Beginner]: 'Beginner',
  [ExerciseLevel.Intermediate]: 'Intermediate',
  [ExerciseLevel.Expert]: 'Expert',
}

export const EXERCISE_MECHANIC_LABELS: Readonly<Record<ExerciseMechanic, string>> = {
  [ExerciseMechanic.Compound]: 'Compound',
  [ExerciseMechanic.Isolation]: 'Isolation',
}

export const EXERCISE_FORCE_LABELS: Readonly<Record<ExerciseForce, string>> = {
  [ExerciseForce.Push]: 'Push',
  [ExerciseForce.Pull]: 'Pull',
  [ExerciseForce.Static]: 'Static',
}

export const EXERCISE_CATEGORY_LABELS: Readonly<Record<ExerciseCategory, string>> = {
  [ExerciseCategory.Cardio]: 'Cardio',
  [ExerciseCategory.OlympicWeightlifting]: 'Olympic Weightlifting',
  [ExerciseCategory.Plyometrics]: 'Plyometrics',
  [ExerciseCategory.Powerlifting]: 'Powerlifting',
  [ExerciseCategory.Strength]: 'Strength',
  [ExerciseCategory.Stretching]: 'Stretching',
  [ExerciseCategory.Strongman]: 'Strongman',
}

/** Static UI copy for the exercise browser/detail screens. */
export const UiText = {
  appName: 'MuscleMap',
  searchPlaceholder: 'Search exercises…',
  allGroups: 'All muscle groups',
  allEquipment: 'All equipment',
  loading: 'Loading exercises…',
  noResults: 'No exercises match your filters.',
  loadMore: 'Load more',
  backToBrowser: '← All exercises',
  notFound: 'Exercise not found.',
  musclesWorked: 'Muscles worked',
  instructions: 'Instructions',
  noInstructions: 'No instructions provided for this exercise.',
  openMap: 'Muscle map →',
  mapTitle: 'Muscle map',
  mapHelp: 'Tap a muscle to see the exercises that train it.',
  muscleFilterLabel: 'Muscle',
  clearFilter: 'Clear',
  exercisesWord: 'exercises',
  view2dLabel: '2D',
  view3dLabel: '3D',
  map3dHint: 'Drag to rotate · tap a muscle',
  rotateHint: 'Drag to rotate',
  loading3d: 'Loading 3D model…',
  openProgram: 'Program →',
  programTitle: 'Program generator',
  programHelp: 'Pick a split, days per week, and your equipment — get a balanced week.',
  splitLabel: 'Split',
  daysLabel: 'Days / week',
  goalLabel: 'Goal',
  equipmentLabel: 'Equipment',
  allEquipmentShort: 'All',
  setsWord: 'sets',
  repsWord: 'reps',
  regenerate: '↻ Regenerate',
  weeklyVolume: 'Weekly volume (effective sets / muscle)',
  emptyDay: 'No matching exercises — try enabling more equipment.',
} as const
