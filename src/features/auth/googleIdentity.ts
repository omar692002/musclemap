import type { AuthUser } from '../../domain/models/AuthUser'
import { AuthConfig } from '../../config/auth.config'
import { loginWithGoogle } from './authApi'

/**
 * Thin wrapper around Google Identity Services (GIS): loads the official
 * script on demand, renders the "Sign in with Google" button, and turns the
 * returned ID-token credential into our `AuthUser`.
 *
 * When a backend is configured (`VITE_API_BASE_URL`), the credential is
 * exchanged at `/auth/google` for a platform JWT (real session, RBAC-ready).
 * Otherwise — or if the backend is unreachable — it falls back to decoding the
 * ID token locally, so Google sign-in keeps working with no backend at all.
 */

/** The slice of the GIS API this app uses (the SDK ships no TS types). */
interface GsiCredentialResponse {
  readonly credential: string
}

interface GsiIdApi {
  initialize(options: {
    client_id: string
    callback: (response: GsiCredentialResponse) => void
  }): void
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void
  disableAutoSelect(): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GsiIdApi } }
  }
}

let scriptPromise: Promise<void> | undefined

/** Loads the GIS script once; resolves when `window.google` is available. */
function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = AuthConfig.gsiScriptUrl
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${AuthConfig.gsiScriptUrl}`))
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** Decodes a JWT ID token's payload (base64url JSON — display use only). */
function decodeIdToken(credential: string): AuthUser | undefined {
  try {
    const payload = credential.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { name?: string; email?: string; picture?: string }
    if (!claims.name || !claims.email) return undefined
    return { name: claims.name, email: claims.email, avatarUrl: claims.picture }
  } catch {
    return undefined
  }
}

/**
 * Initialises GIS and renders the sign-in button into `parent`.
 * Calls `onUser` with the decoded profile after a successful sign-in.
 */
export async function mountGoogleSignIn(parent: HTMLElement, onUser: (user: AuthUser) => void): Promise<void> {
  await loadGsi()
  const id = window.google?.accounts.id
  if (!id) return
  id.initialize({
    client_id: AuthConfig.googleClientId,
    callback: (response) => {
      // Prefer a backend-issued JWT session; fall back to local decode if there
      // is no backend or it is unreachable (keeps Google sign-in always working).
      void loginWithGoogle(response.credential).then((session) => {
        const user = session?.user ?? decodeIdToken(response.credential)
        if (user) onUser(user)
      })
    },
  })
  // Labeled "Sign in" pill (GIS localises the text to the browser language).
  id.renderButton(parent, { type: 'standard', shape: 'pill', size: 'medium', text: 'signin' })
}

/** Stops GIS from auto-selecting the previous account after sign-out. */
export function disableGoogleAutoSelect(): void {
  window.google?.accounts.id.disableAutoSelect()
}
