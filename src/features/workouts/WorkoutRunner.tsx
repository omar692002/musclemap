import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Clock, Loader2 } from 'lucide-react'
import type { ProgramExercise } from '../../domain/models/WorkoutProgram'
import type { NewWorkoutLog } from './workoutApi'
import { saveWorkout } from './workoutApi'
import { SessionStatus } from '../../domain/enums/SessionStatus'
import { MediaKind } from '../../domain/enums/MediaKind'
import { AppRoutes } from '../../config/routes'
import { UiText } from '../../config/labels'
import { ExerciseImage } from '../../components/ExerciseImage'

/** Per-exercise mutable state the user edits while training. */
interface RowState {
  reps: string
  weight: string
  completed: boolean
}

/** The first integer in a rep prescription ("6–10" → 6, "8" → 8, "30s" → 30). */
function parseFirstInt(value: string): number | null {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

/** Elapsed time as m:ss. */
function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

function initialRows(items: readonly ProgramExercise[]): RowState[] {
  return items.map((item) => ({
    reps: String(parseFirstInt(item.reps) ?? ''),
    weight: '',
    completed: false,
  }))
}

/**
 * The live workout runner (EM6): a session timer, per-exercise check-off and
 * editable reps/weight. Finishing persists the session (sets/reps/weight/
 * duration) via {@link saveWorkout} and returns home, where the dashboard's
 * streak / activity / recent sections light up.
 */
export function WorkoutRunner({
  items,
  sessionId,
  focus,
  title,
  onCancel,
}: {
  items: readonly ProgramExercise[]
  sessionId: string
  focus: string | null
  title: string
  onCancel: () => void
}) {
  const navigate = useNavigate()
  // Set on mount (Date.now() is impure, so it can't run during render).
  const startedAtRef = useRef<number>(0)
  const [elapsed, setElapsed] = useState(0)
  const [rows, setRows] = useState<RowState[]>(() => initialRows(items))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
    const timer = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function update(index: number, patch: Partial<RowState>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  async function finish() {
    if (saving) return
    setSaving(true)
    const log: NewWorkoutLog = {
      sessionId,
      name: title,
      focus,
      status: SessionStatus.Completed,
      startedAt: new Date(startedAtRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
      exercises: items.map((item, i) => ({
        exerciseRef: item.exercise.id,
        exerciseName: item.exercise.name,
        position: i,
        sets: item.sets,
        reps: parseFirstInt(rows[i].reps),
        weightKg: rows[i].weight ? Number(rows[i].weight) : null,
        completed: rows[i].completed,
      })),
    }
    try {
      await saveWorkout(log)
      navigate(AppRoutes.home)
    } catch {
      // saveWorkout already degrades to local storage; only a thrown bug lands here.
      setSaving(false)
    }
  }

  const doneCount = rows.filter((row) => row.completed).length

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      {/* Sticky timer + finish bar. */}
      <div className="-mx-4 -mt-4 mb-3 flex items-center justify-between gap-3 rounded-t-2xl border-b border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur">
        <span className="inline-flex items-center gap-1.5 text-lg font-bold tabular-nums text-zinc-900">
          <Clock className="h-4.5 w-4.5 text-orange-600" aria-hidden />
          {formatElapsed(elapsed)}
        </span>
        <span className="text-xs font-medium text-zinc-400">
          {doneCount}/{rows.length}
        </span>
        <button
          type="button"
          onClick={finish}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 active:scale-95 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Check className="h-4 w-4" aria-hidden />
          )}
          {saving ? UiText.savingWorkout : UiText.finishWorkout}
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-zinc-100">
        {items.map((item, i) => {
          const row = rows[i]
          const images = item.exercise.media
            .filter((media) => media.kind === MediaKind.Image)
            .map((media) => media.url)
          return (
            <li key={item.exercise.id} className="flex items-center gap-3 py-3">
              <ExerciseImage
                images={images}
                alt={item.exercise.name}
                className={`h-12 w-12 shrink-0 rounded-xl border border-zinc-200/80 transition ${row.completed ? 'opacity-50' : ''}`}
              />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${row.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                  {item.exercise.name}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-zinc-400">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={row.reps}
                      onChange={(e) => update(i, { reps: e.target.value })}
                      className="w-12 rounded-lg border border-zinc-200 px-2 py-1 text-center text-sm font-semibold text-zinc-800 tabular-nums focus:border-orange-400 focus:outline-none"
                      aria-label={UiText.repsWord}
                    />
                    {UiText.repsWord}
                  </label>
                  <span className="text-xs text-zinc-300" aria-hidden>
                    ×{item.sets}
                  </span>
                  <label className="flex items-center gap-1 text-xs text-zinc-400">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.5"
                      value={row.weight}
                      onChange={(e) => update(i, { weight: e.target.value })}
                      placeholder="—"
                      className="w-16 rounded-lg border border-zinc-200 px-2 py-1 text-center text-sm font-semibold text-zinc-800 tabular-nums focus:border-orange-400 focus:outline-none"
                      aria-label={UiText.weightWord}
                    />
                    kg
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => update(i, { completed: !row.completed })}
                aria-pressed={row.completed}
                aria-label={UiText.doneLabel}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition active:scale-90 ${
                  row.completed
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-zinc-200 text-transparent hover:border-orange-300'
                }`}
              >
                <Check className="h-4.5 w-4.5" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="mt-3 w-full rounded-xl border border-zinc-200 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-60"
      >
        {UiText.cancelWorkout}
      </button>
    </section>
  )
}
