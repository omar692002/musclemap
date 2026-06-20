import type { CoachVideo, CoachVideoDraft } from '../../domain/models/CoachVideo'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'

/**
 * Client for the Coach Platform (EM10). Like {@link ../admin/adminApi} there is
 * no localStorage fallback: coach content lives on the server (it's the platform's
 * shared, copyright-clean moat), so it is meaningful only against a real backend
 * with a bearer token. {@link isCoachBackendReady} gates the Studio UI; the
 * consumer library degrades to an honest "needs backend" state the same way.
 */

/** Raised when a coach/content call fails; carries the HTTP status for the UI. */
export class CoachApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'CoachApiError'
  }
}

/** Whether the coach/content API can be called at all (backend wired + we hold a token). */
export function isCoachBackendReady(): boolean {
  return isBackendAuthEnabled() && getStoredToken() != null
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isBackendAuthEnabled()) {
    throw new CoachApiError('No backend configured', 0)
  }
  let res: Response
  try {
    res = await fetch(`${AuthConfig.apiBaseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...init?.headers },
    })
  } catch {
    throw new CoachApiError('Network error', 0)
  }
  if (!res.ok) {
    throw new CoachApiError(`Request failed (${res.status})`, res.status)
  }
  // 204 No Content (delete) has an empty body.
  return (res.status === 204 ? undefined : await res.json()) as T
}

// --- Coach Studio (author's own library) ----------------------------------

/** Loads the current coach's own library (drafts + published), newest first. */
export function fetchMyContent(): Promise<CoachVideo[]> {
  return request<CoachVideo[]>('/coach/videos')
}

/** Creates a content item (starts unpublished); returns the saved record. */
export function createContent(draft: CoachVideoDraft): Promise<CoachVideo> {
  return request<CoachVideo>('/coach/videos', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
}

/** Updates one of the coach's own items; returns the updated record. */
export function updateContent(id: string, draft: CoachVideoDraft): Promise<CoachVideo> {
  return request<CoachVideo>(`/coach/videos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  })
}

/** Publishes or unpublishes one of the coach's own items; returns the updated record. */
export function setContentPublished(id: string, published: boolean): Promise<CoachVideo> {
  return request<CoachVideo>(`/coach/videos/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ published }),
  })
}

/** Deletes one of the coach's own items. */
export function deleteContent(id: string): Promise<void> {
  return request<void>(`/coach/videos/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// --- Content library (consumer side) --------------------------------------

/** Loads every published coach content item, newest first. */
export function fetchPublishedContent(): Promise<CoachVideo[]> {
  return request<CoachVideo[]>('/content/videos')
}
