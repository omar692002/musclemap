import type { UserRole } from '../enums/UserRole'

/** The signed-in user's public profile (from the identity provider). Immutable. */
export interface AuthUser {
  readonly name: string
  readonly email: string
  readonly avatarUrl?: string
  /**
   * Platform role, present only for backend-issued sessions (EM9). Undefined for
   * the client-side-only Google fallback; callers must treat undefined as
   * non-privileged (see {@link UserRole}).
   */
  readonly role?: UserRole
}
