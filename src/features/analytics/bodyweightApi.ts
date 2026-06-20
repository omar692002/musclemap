import type { BodyweightEntry } from '../../domain/models/BodyweightEntry'
import { StorageKey } from '../../domain/enums/StorageKey'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'

/**
 * Client for bodyweight tracking (EM7). Mirrors the EM6 workout client: when a
 * backend is configured (`VITE_API_BASE_URL`) and we hold a bearer token,
 * weigh-ins round-trip through `POST|GET|DELETE /bodyweight`. Otherwise — the
 * static GitHub-Pages deploy with no backend — they persist to localStorage so
 * the analytics chart still works for guest/client-side sessions.
 *
 * At most one entry per calendar day: logging again on the same day replaces the
 * value, both server-side (the service upserts) and in the local cache.
 */

/** Shape exchanged with the backend (weight is a JSON number; date an ISO day). */
interface BodyweightPayload {
  id?: string
  weightKg: number
  recordedOn: string
  note?: string | null
}

/** What the logger hands over for a new weigh-in (no id yet). */
export type NewBodyweightEntry = Omit<BodyweightEntry, 'id'>

function toEntry(payload: BodyweightPayload): BodyweightEntry {
  return {
    id: payload.id ?? crypto.randomUUID(),
    weightKg: payload.weightKg,
    recordedOn: payload.recordedOn,
    note: payload.note ?? null,
  }
}

/** Oldest first — the natural order for a trend chart. */
function byRecordedAsc(a: BodyweightEntry, b: BodyweightEntry): number {
  return a.recordedOn.localeCompare(b.recordedOn)
}

/** Reads the locally cached weigh-ins synchronously (oldest first). */
export function readLocalBodyweight(): BodyweightEntry[] {
  try {
    const raw = localStorage.getItem(StorageKey.BodyweightLogs)
    if (!raw) return []
    const entries = (JSON.parse(raw) as BodyweightEntry[]) ?? []
    return [...entries].sort(byRecordedAsc)
  } catch {
    return []
  }
}

function writeLocalBodyweight(entries: readonly BodyweightEntry[]): void {
  try {
    localStorage.setItem(StorageKey.BodyweightLogs, JSON.stringify(entries))
  } catch {
    // Storage unavailable (privacy mode): keep the in-memory list only.
  }
}

/** Upserts an entry into a list by day (replacing any same-day weigh-in). */
function upsertByDay(entries: readonly BodyweightEntry[], entry: BodyweightEntry): BodyweightEntry[] {
  const withoutDay = entries.filter((e) => e.recordedOn !== entry.recordedOn)
  return [...withoutDay, entry].sort(byRecordedAsc)
}

/** Whether weigh-ins round-trip through the backend (vs local-only). */
function usesBackend(): boolean {
  return isBackendAuthEnabled() && getStoredToken() != null
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Logs a weigh-in (backend when available); always caches locally. */
export async function logBodyweight(entry: NewBodyweightEntry): Promise<BodyweightEntry> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/bodyweight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ weightKg: entry.weightKg, recordedOn: entry.recordedOn, note: entry.note }),
      })
      if (res.ok) {
        const saved = toEntry((await res.json()) as BodyweightPayload)
        writeLocalBodyweight(upsertByDay(readLocalBodyweight(), saved))
        return saved
      }
    } catch {
      // Degrade to local persistence so logging never dead-ends.
    }
  }
  const local: BodyweightEntry = { ...entry, id: crypto.randomUUID() }
  writeLocalBodyweight(upsertByDay(readLocalBodyweight(), local))
  return local
}

/** Lists the user's weigh-ins (backend when available, else local cache). */
export async function listBodyweight(): Promise<BodyweightEntry[]> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/bodyweight`, {
        headers: { ...authHeaders() },
      })
      if (res.ok) {
        const entries = ((await res.json()) as BodyweightPayload[]).map(toEntry).sort(byRecordedAsc)
        writeLocalBodyweight(entries)
        return entries
      }
    } catch {
      // Network/CORS error or backend down: fall through to the local cache.
    }
  }
  return readLocalBodyweight()
}

/** Clears the locally cached weigh-ins (called on sign-out). */
export function clearLocalBodyweight(): void {
  try {
    localStorage.removeItem(StorageKey.BodyweightLogs)
  } catch {
    // Nothing stored / storage unavailable — nothing to do.
  }
}
