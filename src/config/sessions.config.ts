import { BicepsFlexed, Dumbbell, Footprints, HeartPulse, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DayFocus } from '../domain/enums/DayFocus'
import { TrainingGoal } from '../domain/enums/TrainingGoal'

/**
 * The quick-start sessions shown on the home screen — the first thing a user
 * sees. A session is either a body-part day (a `DayFocus`, whose muscle groups
 * come from `TEMPLATE_BY_FOCUS`) or the special cardio session. Each carries an
 * icon + a Tailwind gradient for its card. Order here is the order on the home grid.
 */
export interface WorkoutSession {
  /** URL id: a DayFocus value, or the literal "cardio". */
  readonly id: string
  /** Muscle-group day (absent for cardio). */
  readonly focus?: DayFocus
  /** Cardio/conditioning session (no muscle groups). */
  readonly cardio?: boolean
  readonly icon: LucideIcon
  /** Tailwind `from-… to-…` classes for the card / banner gradient. */
  readonly gradient: string
}

export const CARDIO_SESSION_ID = 'cardio'

export const HOME_SESSIONS: readonly WorkoutSession[] = [
  { id: DayFocus.ChestTriceps, focus: DayFocus.ChestTriceps, icon: Dumbbell, gradient: 'from-rose-500 to-orange-500' },
  { id: DayFocus.BackBiceps, focus: DayFocus.BackBiceps, icon: BicepsFlexed, gradient: 'from-amber-500 to-orange-600' },
  { id: DayFocus.ShouldersCore, focus: DayFocus.ShouldersCore, icon: Shield, gradient: 'from-sky-500 to-indigo-500' },
  { id: DayFocus.Legs, focus: DayFocus.Legs, icon: Footprints, gradient: 'from-violet-500 to-purple-600' },
  { id: CARDIO_SESSION_ID, cardio: true, icon: HeartPulse, gradient: 'from-emerald-500 to-teal-600' },
]

export const SESSION_BY_ID: ReadonlyMap<string, WorkoutSession> = new Map(
  HOME_SESSIONS.map((session) => [session.id, session]),
)

/** Tuning for the quick sessions (richer than the planner's 1/group). */
export const SessionConfig = {
  perGroup: 2,
  cardioCount: 4,
  goal: TrainingGoal.Hypertrophy,
} as const
