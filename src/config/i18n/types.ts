import type { MuscleGroup } from '../../domain/enums/MuscleGroup'
import type { Equipment } from '../../domain/enums/Equipment'
import type { MuscleRole } from '../../domain/enums/MuscleRole'
import type { SplitType } from '../../domain/enums/SplitType'
import type { TrainingGoal } from '../../domain/enums/TrainingGoal'
import type { DayFocus } from '../../domain/enums/DayFocus'
import type { ExerciseLevel } from '../../domain/enums/ExerciseLevel'
import type { ExerciseMechanic } from '../../domain/enums/ExerciseMechanic'
import type { ExerciseForce } from '../../domain/enums/ExerciseForce'
import type { ExerciseCategory } from '../../domain/enums/ExerciseCategory'
import type { Gender } from '../../domain/enums/Gender'
import type { FitnessLevel } from '../../domain/enums/FitnessLevel'
import type { ProfileGoal } from '../../domain/enums/ProfileGoal'
import type { TrainingExperience } from '../../domain/enums/TrainingExperience'
import type { Weekday } from '../../domain/enums/Weekday'
import type { RecoveryStatus } from '../../domain/enums/RecoveryStatus'
import type { ProgressionStep } from '../../domain/enums/ProgressionStep'
import type { OverloadCue } from '../../domain/enums/OverloadCue'

/** Static UI copy. One implementation per language keeps the set in lock-step. */
export interface UiStrings {
  readonly appName: string
  readonly searchPlaceholder: string
  readonly allGroups: string
  readonly allEquipment: string
  readonly loading: string
  readonly noResults: string
  readonly loadMore: string
  readonly backToBrowser: string
  readonly notFound: string
  readonly musclesWorked: string
  readonly instructions: string
  readonly noInstructions: string
  readonly openMap: string
  readonly mapTitle: string
  readonly mapHelp: string
  readonly muscleFilterLabel: string
  readonly clearFilter: string
  readonly exercisesWord: string
  readonly map3dHint: string
  readonly rotateHint: string
  readonly loading3d: string
  readonly openProgram: string
  readonly programTitle: string
  readonly programHelp: string
  readonly splitLabel: string
  readonly daysLabel: string
  readonly goalLabel: string
  readonly equipmentLabel: string
  readonly allEquipmentShort: string
  readonly setsWord: string
  readonly repsWord: string
  readonly regenerate: string
  readonly weeklyVolume: string
  readonly emptyDay: string
  readonly dayWord: string
  readonly warmupTitle: string
  readonly languageLabel: string
  // Mobile shell + workout-first home.
  readonly navHome: string
  readonly navExercises: string
  readonly navBody: string
  readonly navPlan: string
  readonly homeGreeting: string
  readonly homePickSession: string
  readonly startWorkout: string
  readonly buildYourOwn: string
  readonly buildYourOwnHint: string
  readonly exercisesHeading: string
  readonly back: string
  readonly cardioTitle: string
  readonly cardioSubtitle: string
  readonly cardioDuration: string
  readonly browseAll: string
  // Exercise media (animated demo + curated video).
  readonly demoLabel: string
  readonly videoGuideLabel: string
  readonly playPauseDemo: string
  // Home structure.
  readonly todaysPick: string
  readonly allSessions: string
  // Auth.
  readonly signIn: string
  readonly signOut: string
  // Onboarding (EM3).
  readonly onboardingTitle: string
  readonly onboardingIntro: string
  readonly onboardingPromptTitle: string
  readonly onboardingPromptBody: string
  readonly onboardingPromptCta: string
  readonly editProfile: string
  readonly onboardingComplete: string
  readonly ageQuestion: string
  readonly genderQuestion: string
  readonly measurementsQuestion: string
  readonly heightLabel: string
  readonly weightLabel: string
  readonly levelQuestion: string
  readonly experienceQuestion: string
  readonly goalQuestion: string
  readonly frequencyQuestion: string
  readonly frequencyUnit: string
  readonly equipmentQuestion: string
  readonly equipmentHint: string
  readonly injuriesQuestion: string
  readonly injuriesPlaceholder: string
  readonly nextStep: string
  readonly backStep: string
  readonly skipStep: string
  readonly finishOnboarding: string
  readonly savingProfile: string
  // Personalized dashboard (EM4).
  readonly recommendedForYou: string
  readonly yourProfile: string
  readonly statDayStreak: string
  readonly statThisWeek: string
  readonly weeklyActivityTitle: string
  readonly recentWorkoutsTitle: string
  readonly noRecentWorkouts: string
  readonly noRecentWorkoutsHint: string
  readonly streakEmptyHint: string
  readonly quickActionsTitle: string
  readonly levelWord: string
  readonly experienceWord: string
  readonly ageWord: string
  readonly heightWord: string
  readonly weightWord: string
  readonly yearsUnit: string
  // Smart Generator V2 (EM5).
  readonly recoveryTitle: string
  readonly recoveryHelp: string
  readonly progressionTitle: string
  readonly progressionHelp: string
  readonly weekWord: string
  readonly perWeekUnit: string
  readonly tunedToProfile: string
  readonly restDayHint: string
  // Workout tracking (EM6).
  readonly finishWorkout: string
  readonly cancelWorkout: string
  readonly savingWorkout: string
  readonly doneLabel: string
}

/**
 * A complete language pack. Every enum-keyed map is exhaustive (TS `Record`
 * enforces it), so a missing translation is a compile error — not a silent
 * English fallback at runtime.
 */
export interface Translation {
  readonly ui: UiStrings
  readonly muscleGroup: Readonly<Record<MuscleGroup, string>>
  readonly equipment: Readonly<Record<Equipment, string>>
  readonly role: Readonly<Record<MuscleRole, string>>
  readonly split: Readonly<Record<SplitType, string>>
  readonly goal: Readonly<Record<TrainingGoal, string>>
  /** Onboarding profile vocabularies (EM3). */
  readonly gender: Readonly<Record<Gender, string>>
  readonly fitnessLevel: Readonly<Record<FitnessLevel, string>>
  readonly profileGoal: Readonly<Record<ProfileGoal, string>>
  readonly experience: Readonly<Record<TrainingExperience, string>>
  readonly dayFocus: Readonly<Record<DayFocus, string>>
  readonly level: Readonly<Record<ExerciseLevel, string>>
  readonly mechanic: Readonly<Record<ExerciseMechanic, string>>
  readonly force: Readonly<Record<ExerciseForce, string>>
  readonly category: Readonly<Record<ExerciseCategory, string>>
  /** Smart Generator V2 vocabularies (EM5). */
  readonly weekday: Readonly<Record<Weekday, string>>
  readonly recoveryStatus: Readonly<Record<RecoveryStatus, string>>
  readonly progressionStep: Readonly<Record<ProgressionStep, string>>
  readonly overloadCue: Readonly<Record<OverloadCue, string>>
  /** Warm-up checklist shown atop each training day. */
  readonly warmup: readonly string[]
}
