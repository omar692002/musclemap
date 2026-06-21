import type { WorkoutLog, WorkoutLogExercise } from '../../domain/models/WorkoutLog'
import { SessionStatus } from '../../domain/enums/SessionStatus'
import { StorageKey } from '../../domain/enums/StorageKey'
import { AuthConfig, isBackendAuthEnabled } from '../../config/auth.config'
import { getStoredToken } from '../auth/authApi'

/**
 * Client for workout tracking (EM6). Mirrors the EM3 profile client: when a
 * backend is configured (`VITE_API_BASE_URL`) and we hold a bearer token, logs
 * round-trip through `POST|GET|DELETE /workouts`. Otherwise — the static
 * GitHub-Pages deploy with no backend — they are persisted to localStorage so
 * tracking still works for guest/client-side sessions.
 *
 * Every successful backend list is also cached locally, so the dashboard's
 * activity summary (which reads the cache synchronously) stays warm offline.
 */

/** Shape exchanged with the backend (timestamps are ISO strings; numbers JSON). */
interface WorkoutExercisePayload {
  exerciseRef: string
  exerciseName: string | null
  position: number
  sets: number | null
  reps: number | null
  weightKg: number | null
  completed: boolean
}

interface WorkoutSessionPayload {
  id?: string
  name: string | null
  focus: string | null
  status?: string
  startedAt: string | null
  completedAt: string | null
  durationSeconds: number | null
  notes?: string | null
  exercises: WorkoutExercisePayload[]
}

/** What the runner hands over when a session is finished (no id yet). */
export type NewWorkoutLog = Omit<WorkoutLog, 'id'>

function toExercise(payload: WorkoutExercisePayload): WorkoutLogExercise {
  return {
    exerciseRef: payload.exerciseRef,
    exerciseName: payload.exerciseName ?? '',
    position: payload.position,
    sets: payload.sets ?? null,
    reps: payload.reps ?? null,
    weightKg: payload.weightKg ?? null,
    completed: payload.completed,
  }
}

function toLog(payload: WorkoutSessionPayload): WorkoutLog {
  return {
    id: payload.id ?? crypto.randomUUID(),
    // The home session id isn't stored server-side; the focus drives the title.
    sessionId: payload.focus ?? '',
    name: payload.name ?? '',
    focus: payload.focus,
    status: (payload.status as SessionStatus) ?? SessionStatus.Completed,
    startedAt: payload.startedAt,
    completedAt: payload.completedAt,
    durationSeconds: payload.durationSeconds,
    exercises: payload.exercises.map(toExercise).sort((a, b) => a.position - b.position),
  }
}

function toPayload(log: NewWorkoutLog): WorkoutSessionPayload {
  return {
    name: log.name,
    focus: log.focus,
    status: log.status,
    startedAt: log.startedAt,
    completedAt: log.completedAt,
    durationSeconds: log.durationSeconds,
    exercises: log.exercises.map((exercise) => ({
      exerciseRef: exercise.exerciseRef,
      exerciseName: exercise.exerciseName,
      position: exercise.position,
      sets: exercise.sets,
      reps: exercise.reps,
      weightKg: exercise.weightKg,
      completed: exercise.completed,
    })),
  }
}

/** Reads the locally cached logs synchronously (newest first). */
export function readLocalWorkouts(): WorkoutLog[] {
  try {
    const raw = localStorage.getItem(StorageKey.WorkoutLogs)
    if (!raw) return []
    const logs = (JSON.parse(raw) as WorkoutLog[]) ?? []
    return [...logs].sort(byCompletedDesc)
  } catch {
    return []
  }
}

function writeLocalWorkouts(logs: readonly WorkoutLog[]): void {
  try {
    localStorage.setItem(StorageKey.WorkoutLogs, JSON.stringify(logs))
  } catch {
    // Storage unavailable (privacy mode): keep the in-memory list only.
  }
}

/** Newest completed first; falls back to any timestamp when not completed. */
function byCompletedDesc(a: WorkoutLog, b: WorkoutLog): number {
  const at = a.completedAt ?? a.startedAt ?? ''
  const bt = b.completedAt ?? b.startedAt ?? ''
  return bt.localeCompare(at)
}

/** Whether logs round-trip through the backend (vs local-only). */
function usesBackend(): boolean {
  return isBackendAuthEnabled() && getStoredToken() != null
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Persists a finished workout (backend when available); always caches locally. */
export async function saveWorkout(log: NewWorkoutLog): Promise<WorkoutLog> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(toPayload(log)),
      })
      if (res.ok) {
        const saved = toLog((await res.json()) as WorkoutSessionPayload)
        // Refresh the local cache from the server so the dashboard reads it.
        writeLocalWorkouts([saved, ...readLocalWorkouts()].sort(byCompletedDesc))
        return saved
      }
    } catch {
      // Degrade to local persistence so tracking never dead-ends.
    }
  }
  const local: WorkoutLog = { ...log, id: crypto.randomUUID() }
  writeLocalWorkouts([local, ...readLocalWorkouts()].sort(byCompletedDesc))
  return local
}

/** Lists the user's logs (backend when available, else local cache). */
export async function listWorkouts(): Promise<WorkoutLog[]> {
  if (usesBackend()) {
    try {
      const res = await fetch(`${AuthConfig.apiBaseUrl}/workouts`, {
        headers: { ...authHeaders() },
      })
      if (res.ok) {
        const logs = ((await res.json()) as WorkoutSessionPayload[]).map(toLog).sort(byCompletedDesc)
        writeLocalWorkouts(logs)
        return logs
      }
    } catch {
      // Network/CORS error or backend down: fall through to the local cache.
    }
  }
  return readLocalWorkouts()
}

/** Clears the locally cached logs (called on sign-out). */
export function clearLocalWorkouts(): void {
  try {
    localStorage.removeItem(StorageKey.WorkoutLogs)
  } catch {
    // Nothing stored / storage unavailable — nothing to do.
  }
}
