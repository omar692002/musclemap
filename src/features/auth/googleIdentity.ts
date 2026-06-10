import type { AuthUser } from '../../domain/models/AuthUser'
import { AuthConfig } from '../../config/auth.config'

/**
 * Thin wrapper around Google Identity Services (GIS): loads the official
 * script on demand, renders the "Sign in with Google" button, and decodes the
 * returned ID-token credential into our `AuthUser`. Client-side only — no
 * backend; the decoded profile is used purely for display/personalisation.
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
      const user = decodeIdToken(response.credential)
      if (user) onUser(user)
    },
  })
  id.renderButton(parent, { type: 'icon', shape: 'pill', size: 'medium' })
}

/** Stops GIS from auto-selecting the previous account after sign-out. */
export function disableGoogleAutoSelect(): void {
  window.google?.accounts.id.disableAutoSelect()
}
