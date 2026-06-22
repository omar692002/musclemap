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
  onboardingSkipped?: boolean
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
    onboardingSkipped: payload.onboardingSkipped ?? false,
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

/**
 * Loads the current user's profile.
 *
 * When a backend is configured:
 *   - 200 OK  → use the server response (source of truth).
 *   - failure → use the local cache if non-empty, otherwise `null`.
 *     Returning `null` (rather than `emptyProfile()`) prevents a blank cache
 *     after sign-out from being misread as "onboarding not done" and triggering
 *     the mandatory-onboarding redirect on the next sign-in.
 *
 * When no backend is configured (static/guest mode):
 *   - always return the local cache (falls back to `emptyProfile()`).
 */
export async function fetchProfile(): Promise<UserProfile | null> {
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
      // Network / CORS error: fall through to the cache.
    }
    // Backend reachable but returned non-OK, or threw. Use local cache only
    // if it actually contains data (i.e. was written before sign-out).
    const cached = readLocalOrNull()
    return cached
  }
  return readLocal()
}

/** Returns null when nothing has been written to the local cache yet. */
function readLocalOrNull(): UserProfile | null {
  try {
    const raw = localStorage.getItem(StorageKey.UserProfile)
    if (!raw) return null
    return toProfile(JSON.parse(raw) as ProfilePayload)
  } catch {
    return null
  }
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

/**
 * Tells the backend to mark this user's onboarding as dismissed. The returned
 * profile (with onboardingSkipped: true) is the source of truth across devices;
 * localStorage remains the fallback for offline / no-backend sessions.
 */
export async function skipOnboardingOnBackend(): Promise<void> {
  if (!usesBackend()) return
  try {
    await fetch(`${AuthConfig.apiBaseUrl}/profile/skip`, {
      method: 'POST',
      headers: { ...authHeaders() },
    })
  } catch {
    // Network failure: localStorage already recorded the skip.
  }
}

/**
 * "Skip onboarding" is remembered per user (by email) and *survives sign-out*,
 * so a user who chose to skip the profile setup is never nagged again on this
 * device — only completing the profile or them re-opening the wizard changes it.
 */
function readSkipped(): string[] {
  try {
    const raw = localStorage.getItem(StorageKey.OnboardingSkipped)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

/** Whether this user previously dismissed the onboarding prompt. */
export function isOnboardingSkipped(email: string): boolean {
  return readSkipped().includes(email)
}

/** Records that this user dismissed the onboarding prompt (idempotent). */
export function skipOnboarding(email: string): void {
  if (!email) return
  const skipped = readSkipped()
  if (skipped.includes(email)) return
  try {
    localStorage.setItem(StorageKey.OnboardingSkipped, JSON.stringify([...skipped, email]))
  } catch {
    // Storage unavailable — the prompt may reappear next session; acceptable.
  }
}
