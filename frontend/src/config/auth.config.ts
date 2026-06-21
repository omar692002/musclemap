/**
 * Authentication configuration (Google Identity Services, client-side OAuth).
 *
 * The client id is public by design (it identifies the app, not a secret).
 * It is injected at build time via the `VITE_GOOGLE_CLIENT_ID` env var:
 *  - locally: put `VITE_GOOGLE_CLIENT_ID=…` in a `.env.local` file;
 *  - CI/Pages: set the `VITE_GOOGLE_CLIENT_ID` repository variable (see
 *    .github/workflows/deploy.yml).
 * When empty, all sign-in UI is hidden and the app works as guest-only.
 */
export const AuthConfig = {
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '',
  /** Google Identity Services script (the official GIS client). */
  gsiScriptUrl: 'https://accounts.google.com/gsi/client',
  /**
   * MuscleMap backend base URL (e.g. https://musclemap-api.onrender.com/api/v1).
   * Injected via `VITE_API_BASE_URL`. When empty, the app stays 100% client-side:
   * Google sign-in falls back to decoding the ID token locally (current behaviour),
   * so the static deploy keeps working with no backend. Trailing slash is trimmed.
   */
  apiBaseUrl: ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/+$/, ''),
} as const

/** Whether sign-in is configured for this build. */
export function isAuthEnabled(): boolean {
  return AuthConfig.googleClientId.length > 0
}

/** Whether a real backend is wired up (enables JWT-backed sessions). */
export function isBackendAuthEnabled(): boolean {
  return AuthConfig.apiBaseUrl.length > 0
}
