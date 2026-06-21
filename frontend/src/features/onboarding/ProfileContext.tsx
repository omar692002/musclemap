import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserProfile } from '../../domain/models/UserProfile'
import { useAuth } from '../auth/AuthContext'
import { fetchProfile, isOnboardingSkipped, skipOnboarding } from './profileApi'

interface ProfileContextValue {
  /** The signed-in user's profile, or null while unknown / signed out. */
  readonly profile: UserProfile | null
  readonly loading: boolean
  /** True once we know the user still needs to onboard (and hasn't skipped). */
  readonly needsOnboarding: boolean
  /** Dismiss the onboarding prompt for this user (remembered across sessions). */
  skip(): void
  /** Re-reads the profile from the backend / local cache. */
  reload(): Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: false,
  needsOnboarding: false,
  skip: () => undefined,
  reload: async () => undefined,
})

/**
 * Loads and holds the onboarding profile for the current session (EM3). The
 * profile is fetched whenever a user signs in and cleared on sign-out, so the
 * Home prompt and the wizard share a single source of truth.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  // Tracks the per-user skip flag so dismissing re-renders without a reload.
  const [skipped, setSkipped] = useState(false)

  const skip = useCallback(() => {
    if (!user) return
    skipOnboarding(user.email)
    setSkipped(true)
  }, [user])

  // Manual refresh (e.g. after the wizard saves) — called from event handlers.
  const reload = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    setLoading(true)
    try {
      setProfile(await fetchProfile())
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load whenever the signed-in identity changes (sign-in / sign-out). The fetch
  // runs in an async IIFE so the profile state is set across the await boundary,
  // with a cancellation guard to drop a response that arrives after unmount/change.
  useEffect(() => {
    let active = true
    void (async () => {
      if (!user) {
        if (active) {
          setProfile(null)
          setSkipped(false)
        }
        return
      }
      if (active) {
        setSkipped(isOnboardingSkipped(user.email))
        setLoading(true)
      }
      try {
        const loaded = await fetchProfile()
        if (active) setProfile(loaded)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [user])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading,
      needsOnboarding: user != null && profile != null && !profile.onboardingCompleted && !skipped,
      skip,
      reload,
    }),
    [profile, loading, user, skipped, skip, reload],
  )
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

/** The current onboarding profile state. */
// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext)
}
