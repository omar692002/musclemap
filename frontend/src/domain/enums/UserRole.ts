/**
 * Platform authorization role (mirrors the backend `com.musclemap.user.Role`).
 *
 * Carried on the signed-in {@link AuthUser} only when a real backend issued the
 * session (the JWT exchange returns it). The purely client-side Google fallback
 * has no backend to ask, so role stays undefined there — and an undefined role is
 * never treated as ADMIN, keeping admin features closed by default.
 */
export enum UserRole {
  User = 'USER',
  Coach = 'COACH',
  Admin = 'ADMIN',
}
