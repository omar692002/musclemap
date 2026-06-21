import { UserRole } from '../../domain/enums/UserRole'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'

/**
 * Client for the admin platform (EM9). Unlike the workout/profile clients there
 * is no localStorage fallback: administration acts on server-side records, so it
 * is meaningful only when a real backend is configured and the caller holds a
 * bearer token for an ADMIN account. {@link isAdminBackendReady} gates the UI.
 */

/** Aggregate platform metrics (mirrors backend `AdminMetricsResponse`). */
export interface AdminMetrics {
  readonly totalUsers: number
  readonly usersByRole: Readonly<Record<string, number>>
  readonly enabledUsers: number
  readonly localUsers: number
  readonly googleUsers: number
  readonly totalProfiles: number
  readonly totalPrograms: number
  readonly totalSessions: number
  readonly completedSessions: number
  readonly coachVideos: number
  readonly publishedVideos: number
}

/** Admin view of a user (mirrors backend `AdminUserResponse`). */
export interface AdminUser {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly authProvider: string
  readonly enabled: boolean
  readonly emailVerified: boolean
  readonly createdAt: string
}

/** Raised when an admin call fails; carries the HTTP status for the UI. */
export class AdminApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'AdminApiError'
  }
}

/** Whether the admin API can be called at all (backend wired + we hold a token). */
export function isAdminBackendReady(): boolean {
  return isBackendAuthEnabled() && getStoredToken() != null
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isBackendAuthEnabled()) {
    throw new AdminApiError('No backend configured', 0)
  }
  let res: Response
  try {
    res = await fetch(`${AuthConfig.apiBaseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...init?.headers },
    })
  } catch {
    throw new AdminApiError('Network error', 0)
  }
  if (!res.ok) {
    throw new AdminApiError(`Request failed (${res.status})`, res.status)
  }
  // 204 No Content has an empty body; callers of mutations re-fetch anyway.
  return (res.status === 204 ? undefined : await res.json()) as T
}

/** Loads the dashboard metrics. */
export function fetchMetrics(): Promise<AdminMetrics> {
  return request<AdminMetrics>('/admin/metrics')
}

/** Loads the full user roster (newest first). */
export function fetchUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>('/admin/users')
}

/** Changes a user's role; returns the updated record. */
export function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${encodeURIComponent(id)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

/** Enables or disables a user account; returns the updated record. */
export function updateUserStatus(id: string, enabled: boolean): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  })
}
