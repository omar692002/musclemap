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
export const BODY_VIEW_LABELS = t.bodyView
export const SPLIT_LABELS = t.split
export const GOAL_LABELS = t.goal
export const DAY_FOCUS_LABELS = t.dayFocus
export const EXERCISE_LEVEL_LABELS = t.level
export const EXERCISE_MECHANIC_LABELS = t.mechanic
export const EXERCISE_FORCE_LABELS = t.force
export const EXERCISE_CATEGORY_LABELS = t.category

/** Standard warm-up checklist shown atop each generated training day. */
export const WARMUP_STEPS = t.warmup

/** Static UI copy for all screens. */
export const UiText = t.ui
