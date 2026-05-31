import { DayFocus } from '../domain/enums/DayFocus'
import { TrainingGoal } from '../domain/enums/TrainingGoal'

/**
 * The quick-start sessions shown on the home screen — the first thing a user
 * sees. A session is either a body-part day (a `DayFocus`, whose muscle groups
 * come from `TEMPLATE_BY_FOCUS`) or the special cardio session. Each carries an
 * icon + accent colour for its card. Order here is the order on the home grid.
 */
export interface WorkoutSession {
  /** URL id: a DayFocus value, or the literal "cardio". */
  readonly id: string
  /** Muscle-group day (absent for cardio). */
  readonly focus?: DayFocus
  /** Cardio/conditioning session (no muscle groups). */
  readonly cardio?: boolean
  readonly icon: string
  readonly accent: string
}

export const CARDIO_SESSION_ID = 'cardio'

export const HOME_SESSIONS: readonly WorkoutSession[] = [
  { id: DayFocus.ChestTriceps, focus: DayFocus.ChestTriceps, icon: '💥', accent: '#ef4444' },
  { id: DayFocus.BackBiceps, focus: DayFocus.BackBiceps, icon: '🦾', accent: '#f59e0b' },
  { id: DayFocus.ShouldersCore, focus: DayFocus.ShouldersCore, icon: '🪨', accent: '#0ea5e9' },
  { id: DayFocus.Legs, focus: DayFocus.Legs, icon: '🦵', accent: '#8b5cf6' },
  { id: CARDIO_SESSION_ID, cardio: true, icon: '🏃', accent: '#10b981' },
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
