import type { AuthUser } from '../../domain/models/AuthUser'
import { UserRole } from '../../domain/enums/UserRole'
import { StorageKey } from '../../domain/enums/StorageKey'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'

/**
 * Thin client for the MuscleMap backend auth API (EM2). Optional by design:
 * when no `VITE_API_BASE_URL` is configured the app runs fully client-side and
 * these helpers are never called (Google sign-in falls back to local decoding).
 *
 * A successful call returns a platform JWT that we persist; later authenticated
 * requests send it as `Authorization: Bearer <token>`.
 */

/** Shape returned by /auth/* endpoints (subset we consume). */
interface BackendAuthResponse {
  readonly token: string
  readonly user: {
    readonly email: string
    readonly displayName?: string | null
    readonly avatarUrl?: string | null
    readonly role?: string | null
  }
}

/** Maps the backend role string onto our enum (unknown/missing → undefined). */
function toRole(value: string | null | undefined): UserRole | undefined {
  return (Object.values(UserRole) as string[]).includes(value ?? '')
    ? (value as UserRole)
    : undefined
}

/** The stored backend session: a bearer token plus the mapped display profile. */
export interface BackendSession {
  readonly token: string
  readonly user: AuthUser
}

function persistToken(token: string): void {
  try {
    localStorage.setItem(StorageKey.AuthToken, token)
  } catch {
    // Storage unavailable (privacy mode): keep using the in-memory session.
  }
}

/** Clears any stored backend token (called on sign-out). */
export function clearStoredToken(): void {
  try {
    localStorage.removeItem(StorageKey.AuthToken)
  } catch {
    // Nothing stored / storage unavailable — nothing to do.
  }
}

/** The current backend bearer token, if any. */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(StorageKey.AuthToken)
  } catch {
    return null
  }
}

function toAuthUser(response: BackendAuthResponse): AuthUser {
  const { email, displayName, avatarUrl, role } = response.user
  return {
    name: displayName && displayName.length > 0 ? displayName : email,
    email,
    avatarUrl: avatarUrl ?? undefined,
    role: toRole(role),
  }
}

/**
 * Exchanges a Google Identity credential (ID token) for a backend session.
 * Returns `null` when no backend is configured or the exchange fails, so callers
 * can fall back to the purely client-side flow without surfacing an error.
 */
export async function loginWithGoogle(credential: string): Promise<BackendSession | null> {
  if (!isBackendAuthEnabled()) return null
  try {
    const res = await fetch(`${AuthConfig.apiBaseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as BackendAuthResponse
    if (!data.token || !data.user?.email) return null
    persistToken(data.token)
    return { token: data.token, user: toAuthUser(data) }
  } catch {
    // Network/CORS error or backend down: degrade gracefully to client-side auth.
    return null
  }
}

/**
 * Raised by the email/password flows so the form can show a useful message.
 * Distinct from a `null` return (used by Google) because, unlike Google, there
 * is no client-side fallback for email/password — it strictly needs the backend.
 */
export class AuthApiError extends Error {}

/** Extracts the backend's error message (validation / "bad credentials") if any. */
async function readError(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { message?: string; detail?: string }
    return body.message ?? body.detail
  } catch {
    return undefined
  }
}

/** POSTs an email/password payload to an /auth endpoint and stores the session. */
async function postCredentials(
  path: '/login' | '/register',
  body: Record<string, string>,
  fallbackError: string,
): Promise<BackendSession> {
  if (!isBackendAuthEnabled()) throw new AuthApiError('backend-required')
  let res: Response
  try {
    res = await fetch(`${AuthConfig.apiBaseUrl}/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AuthApiError('network')
  }
  if (!res.ok) throw new AuthApiError((await readError(res)) ?? fallbackError)
  const data = (await res.json()) as BackendAuthResponse
  if (!data.token || !data.user?.email) throw new AuthApiError(fallbackError)
  persistToken(data.token)
  return { token: data.token, user: toAuthUser(data) }
}

/** Authenticates an existing email/password account (backend required). */
export function loginWithEmail(email: string, password: string): Promise<BackendSession> {
  return postCredentials('/login', { email, password }, 'login-failed')
}

/** Creates a new email/password account and signs in (backend required). */
export function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<BackendSession> {
  return postCredentials('/register', { email, password, displayName }, 'register-failed')
}
