import type { Exercise } from '../../domain/models/Exercise'
import type { Muscle } from '../../domain/models/Muscle'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'

/**
 * Client for the public catalogue API (EM13): the exercise + muscle taxonomy
 * that used to be bundled statically. The backend returns the same JSON shape as
 * the domain `Exercise`/`Muscle` models (enum values are the wire format), so the
 * payload maps onto the domain types directly.
 *
 * Each resource is fetched at most once and the in-flight promise is memoised, so
 * the two repositories (and every screen sharing them) trigger a single network
 * round-trip. Any failure — backend down, CORS, offline — resolves to `null` so
 * the caller can fall back to the bundled static dataset (never rejects).
 */

let exercisesPromise: Promise<readonly Exercise[] | null> | null = null
let musclesPromise: Promise<readonly Muscle[] | null> | null = null

async function getJson<T>(path: string): Promise<T | null> {
  if (!isBackendAuthEnabled()) return null
  try {
    const res = await fetch(`${AuthConfig.apiBaseUrl}${path}`)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Network/CORS error or backend down: signal fallback to static.
    return null
  }
}

/** The full exercise catalogue from the API, or `null` to fall back to static. */
export function fetchCatalogExercises(): Promise<readonly Exercise[] | null> {
  if (!exercisesPromise) {
    exercisesPromise = getJson<readonly Exercise[]>('/catalog/exercises')
  }
  return exercisesPromise
}

/** The muscle taxonomy from the API, or `null` to fall back to static. */
export function fetchCatalogMuscles(): Promise<readonly Muscle[] | null> {
  if (!musclesPromise) {
    musclesPromise = getJson<readonly Muscle[]>('/catalog/muscles')
  }
  return musclesPromise
}
