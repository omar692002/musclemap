import { Link } from 'react-router-dom'
import type { WorkoutDay } from '../../../domain/models/WorkoutProgram'
import { exerciseDetailPath } from '../../../config/routes'
import { UiText, DAY_FOCUS_LABELS, WARMUP_STEPS } from '../../../config/labels'

interface ProgramDayCardProps {
  readonly day: WorkoutDay
}

/** One day of the generated program: focus + a warm-up + its exercises/reps. */
export function ProgramDayCard({ day }: ProgramDayCardProps) {
  const hasExercises = day.exercises.length > 0
  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-800/40 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-slate-100">{DAY_FOCUS_LABELS[day.focus]}</h3>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {UiText.dayWord} {day.index}
        </span>
      </div>

      {hasExercises ? (
        <div className="mb-3 rounded-lg border border-slate-700/60 bg-slate-800/60 p-2.5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-300">{UiText.warmupTitle}</p>
          <ul className="flex list-disc flex-col gap-0.5 ps-4 text-xs text-slate-400">
            {WARMUP_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasExercises ? (
        <p className="text-sm text-slate-500">{UiText.emptyDay}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-800">
          {day.exercises.map(({ exercise, sets, reps }) => (
            <li key={exercise.id} className="flex items-center justify-between gap-3 py-2">
              <Link
                to={exerciseDetailPath(exercise.id)}
                className="text-sm text-slate-200 hover:text-sky-300"
              >
                {exercise.name}
              </Link>
              <span className="shrink-0 text-xs tabular-nums text-slate-400">
                {sets} × {reps}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
