import type { UserProfile } from '../../domain/models/UserProfile'
import { emptyProfile } from '../../domain/models/UserProfile'
import { StorageKey } from '../../domain/enums/StorageKey'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'

/**
 * Client for the onboarding profile (EM3). Mirrors the auth client's design:
 * when a backend is configured (`VITE_API_BASE_URL`) and we hold a bearer token,
 * the profile is read from / written to `GET|PUT /profile`. Otherwise — the
 * static GitHub-Pages deploy with no backend — the profile is persisted locally
 * so the onboarding flow still works for guest/client-side sessions.
 *
 * Every successful backend call is also cached locally, so a later offline read
 * still returns the user's data.
 */

/** Shape exchanged with the backend (numbers come back as JSON numbers). */
interface ProfilePayload {
  age: number | null
  gender: string | null
  heightCm: number | null
  weightKg: number | null
  fitnessLevel: string | null
  trainingExperience: string | null
  trainingGoal: string | null
  weeklyFrequency: number | null
  availableEquipment: string[]
  injuryLimitations: string | null
  onboardingCompleted?: boolean
}

function toProfile(payload: ProfilePayload): UserProfile {
  const base = emptyProfile()
  return {
    age: payload.age ?? null,
    gender: (payload.gender as UserProfile['gender']) ?? null,
    heightCm: payload.heightCm ?? null,
    weightKg: payload.weightKg ?? null,
    fitnessLevel: (payload.fitnessLevel as UserProfile['fitnessLevel']) ?? null,
    trainingExperience: (payload.trainingExperience as UserProfile['trainingExperience']) ?? null,
    trainingGoal: (payload.trainingGoal as UserProfile['trainingGoal']) ?? null,
    weeklyFrequency: payload.weeklyFrequency ?? null,
    availableEquipment: (payload.availableEquipment as UserProfile['availableEquipment']) ?? base.availableEquipment,
    injuryLimitations: payload.injuryLimitations ?? null,
    onboardingCompleted: payload.onboardingCompleted ?? false,
  }
}

/** PUT bodies never send the derived `onboardingCompleted` (server owns it). */
function toPayload(profile: UserProfile): ProfilePayload {
  return {
    age: profile.age,
    gender: profile.gender,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    fitnessLevel: profile.fitnessLevel,
    trainingExperience: profile.trainingExperience,
    trainingGoal: profile.trainingGoal,
    weeklyFrequency: profile.weeklyFrequency,
    availableEquipment: [...profile.availableEquipment],
    injuryLimitations: profile.injuryLimitations,
  }
}

function readLocal(): UserProfile {
  try {
    const raw = localStorage.getItem(StorageKey.UserProfile)
    if (!raw) return emptyProfile()
    return toProfile(JSON.parse(raw) as ProfilePayload)
  } catch {
    return emptyProfile()
  }
}

function writeLocal(profile: UserProfile): void {
  try {
    localStorage.setItem(StorageKey.UserProfile, JSON.stringify(profile))
  } catch {
    // Storage unavailable (privacy mode): keep the in-memory profile only.
  }
}

/** Whether the profile round-trips through the backend (vs local-only). */
function usesBackend(): boolean {
  return isBackendAuthEnabled() && getStoredToken() != null
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Loads the current user's profile (backend when available, else local cache). */
export async function fetchProfile(): Promise<UserProfile> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/profile`, {
        headers: { ...authHeaders() },
      })
      if (res.ok) {
        const profile = toProfile((await res.json()) as ProfilePayload)
        writeLocal(profile)
        return profile
      }
    } catch {
      // Network/CORS error or backend down: fall through to the local cache.
    }
  }
  return readLocal()
}

/** Saves the profile (backend when available); always caches locally. */
export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(toPayload(profile)),
      })
      if (res.ok) {
        const saved = toProfile((await res.json()) as ProfilePayload)
        writeLocal(saved)
        return saved
      }
    } catch {
      // Degrade to local persistence so onboarding never dead-ends.
    }
  }
  // Local path: derive completion the same way the server would.
  const localSaved: UserProfile = { ...profile, onboardingCompleted: isComplete(profile) }
  writeLocal(localSaved)
  return localSaved
}

/** Onboarding is complete once the personalization essentials are present. */
export function isComplete(profile: UserProfile): boolean {
  return (
    profile.age != null &&
    profile.gender != null &&
    profile.heightCm != null &&
    profile.weightKg != null &&
    profile.fitnessLevel != null &&
    profile.trainingGoal != null &&
    profile.weeklyFrequency != null
  )
}

/** Clears the locally cached profile (called on sign-out). */
export function clearLocalProfile(): void {
  try {
    localStorage.removeItem(StorageKey.UserProfile)
  } catch {
    // Nothing stored / storage unavailable — nothing to do.
  }
}
