import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '../../domain/models/AuthUser'
import { StorageKey } from '../../domain/enums/StorageKey'
import { disableGoogleAutoSelect } from './googleIdentity'

interface AuthContextValue {
  readonly user: AuthUser | null
  signIn(user: AuthUser): void
  signOut(): void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: () => undefined,
  signOut: () => undefined,
})

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(StorageKey.AuthUser)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthUser>
    return parsed.name && parsed.email
      ? { name: parsed.name, email: parsed.email, avatarUrl: parsed.avatarUrl }
      : null
  } catch {
    return null
  }
}

/** Session-persistent auth state (profile in localStorage; GIS issues it). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  const signIn = useCallback((next: AuthUser) => {
    try {
      localStorage.setItem(StorageKey.AuthUser, JSON.stringify(next))
    } catch {
      // Persistence unavailable (privacy mode) — keep the in-memory session.
    }
    setUser(next)
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(StorageKey.AuthUser)
    } catch {
      // Nothing stored / storage unavailable — still clear the session.
    }
    disableGoogleAutoSelect()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** The current auth session (user is null when signed out / auth disabled). */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
