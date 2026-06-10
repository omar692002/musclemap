/** The signed-in user's public profile (from the identity provider). Immutable. */
export interface AuthUser {
  readonly name: string
  readonly email: string
  readonly avatarUrl?: string
}
