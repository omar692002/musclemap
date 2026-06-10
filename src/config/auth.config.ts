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
} as const

/** Whether sign-in is configured for this build. */
export function isAuthEnabled(): boolean {
  return AuthConfig.googleClientId.length > 0
}
