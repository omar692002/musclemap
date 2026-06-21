import type { AuthUser } from '../../domain/models/AuthUser'
import { UserRole } from '../../domain/enums/UserRole'

/**
 * "Staff" = a coach or an admin. They run the platform, so the member-facing
 * flows — mandatory onboarding, the "complete your profile" nudge, the premium
 * upsell and the Free/Premium plan badge — are irrelevant to them and hidden.
 * An undefined role (client-side Google fallback) is treated as a plain member.
 */
export function isStaff(user: AuthUser | null | undefined): boolean {
  return user?.role === UserRole.Coach || user?.role === UserRole.Admin
}
