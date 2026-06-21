import { getActiveLanguage, TRANSLATIONS } from './i18n'

/**
 * Human-readable labels for enum values, and static UI copy.
 *
 * Centralised so the UI never hardcodes display strings (project rule). The
 * values are resolved from the active language pack (config/i18n) once, at
 * import time — so every component keeps importing the same names and switching
 * language simply reloads the app (see config/i18n → setActiveLanguage).
 */
const t = TRANSLATIONS[getActiveLanguage()]

export const MUSCLE_GROUP_LABELS = t.muscleGroup
export const EQUIPMENT_LABELS = t.equipment
export const MUSCLE_ROLE_LABELS = t.role
export const SPLIT_LABELS = t.split
export const GOAL_LABELS = t.goal
export const GENDER_LABELS = t.gender
export const FITNESS_LEVEL_LABELS = t.fitnessLevel
export const PROFILE_GOAL_LABELS = t.profileGoal
export const EXPERIENCE_LABELS = t.experience
export const DAY_FOCUS_LABELS = t.dayFocus
export const EXERCISE_LEVEL_LABELS = t.level
export const EXERCISE_MECHANIC_LABELS = t.mechanic
export const EXERCISE_FORCE_LABELS = t.force
export const EXERCISE_CATEGORY_LABELS = t.category
// Smart Generator V2 (EM5).
export const WEEKDAY_LABELS = t.weekday
export const RECOVERY_STATUS_LABELS = t.recoveryStatus
export const PROGRESSION_STEP_LABELS = t.progressionStep
export const OVERLOAD_CUE_LABELS = t.overloadCue
// Advanced Muscle Intelligence (EM8).
export const TRAINING_STATUS_LABELS = t.trainingStatus
export const MUSCLE_READINESS_LABELS = t.muscleReadiness
export const RECOVERY_ADVICE_LABELS = t.recoveryAdvice
// Admin Platform (EM9).
export const USER_ROLE_LABELS = t.userRole
// Coach Platform (EM10).
export const COACH_CONTENT_TYPE_LABELS = t.coachContentType
// Subscription Architecture (EM11).
export const SUBSCRIPTION_PLAN_LABELS = t.subscriptionPlan
// Product polish (EM12).
export const THEME_LABELS = t.theme

/** Standard warm-up checklist shown atop each generated training day. */
export const WARMUP_STEPS = t.warmup

/** Static UI copy for all screens. */
export const UiText = t.ui
