import { ProfileGoal } from '../domain/enums/ProfileGoal'
import type { UserProfile } from '../domain/models/UserProfile'
import {
  CARDIO_SESSION_ID,
  HOME_SESSIONS,
  SESSION_BY_ID,
  suggestedSessionFor,
  type WorkoutSession,
} from './sessions.config'

/**
 * Picks the session to feature on the dashboard for a given user (EM4). Goals
 * that lean on conditioning (fat loss / endurance) surface the cardio session;
 * everyone else gets the strength-day rotation (`suggestedSessionFor`). Falls
 * back to the rotation when the profile is missing or has no goal yet, so the
 * dashboard always has a recommendation to show.
 */
export function recommendedSessionFor(profile: UserProfile | null, date: Date): WorkoutSession {
  const goal = profile?.trainingGoal
  if (goal === ProfileGoal.LoseFat || goal === ProfileGoal.ImproveEndurance) {
    return SESSION_BY_ID.get(CARDIO_SESSION_ID) ?? HOME_SESSIONS[0]
  }
  return suggestedSessionFor(date)
}
