import { BicepsFlexed, Dumbbell, Footprints, HeartPulse, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DayFocus } from '../domain/enums/DayFocus'
import { TrainingGoal } from '../domain/enums/TrainingGoal'

/**
 * The quick-start sessions shown on the home screen — the first thing a user
 * sees. A session is either a body-part day (a `DayFocus`, whose muscle groups
 * come from `TEMPLATE_BY_FOCUS`) or the special cardio session.
 *
 * Colour discipline: the home screen stays in the brand palette. Only the
 * day's featured session gets the full ember gradient; the rest are white
 * cards whose colour is confined to a small tinted icon chip (`chip`).
 */
export interface WorkoutSession {
  /** URL id: a DayFocus value, or the literal "cardio". */
  readonly id: string
  /** Muscle-group day (absent for cardio). */
  readonly focus?: DayFocus
  /** Cardio/conditioning session (no muscle groups). */
  readonly cardio?: boolean
  readonly icon: LucideIcon
  /** Tailwind classes for the small icon chip on white cards. */
  readonly chip: string
}

/** The single brand gradient used for hero cards and session banners. */
export const SESSION_HERO_GRADIENT = 'from-orange-500 via-orange-600 to-red-600'

export const CARDIO_SESSION_ID = 'cardio'

export const HOME_SESSIONS: readonly WorkoutSession[] = [
  { id: DayFocus.ChestTriceps, focus: DayFocus.ChestTriceps, icon: Dumbbell, chip: 'bg-orange-50 text-orange-600' },
  { id: DayFocus.BackBiceps, focus: DayFocus.BackBiceps, icon: BicepsFlexed, chip: 'bg-amber-50 text-amber-600' },
  { id: DayFocus.ShouldersCore, focus: DayFocus.ShouldersCore, icon: Shield, chip: 'bg-zinc-100 text-zinc-600' },
  { id: DayFocus.Legs, focus: DayFocus.Legs, icon: Footprints, chip: 'bg-stone-100 text-stone-600' },
  { id: CARDIO_SESSION_ID, cardio: true, icon: HeartPulse, chip: 'bg-red-50 text-red-600' },
]

export const SESSION_BY_ID: ReadonlyMap<string, WorkoutSession> = new Map(
  HOME_SESSIONS.map((session) => [session.id, session]),
)

/**
 * The session featured as "today's workout": a fixed weekly rotation
 * (Mon = chest, Tue = back, … cycling through the session list).
 */
export function suggestedSessionFor(date: Date): WorkoutSession {
  const mondayBased = (date.getDay() + 6) % 7
  return HOME_SESSIONS[mondayBased % HOME_SESSIONS.length]
}

/** Tuning for the quick sessions (richer than the planner's 1/group). */
export const SessionConfig = {
  perGroup: 2,
  cardioCount: 4,
  goal: TrainingGoal.Hypertrophy,
} as const
