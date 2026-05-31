import { Link } from 'react-router-dom'
import type { WorkoutDay } from '../../../domain/models/WorkoutProgram'
import { exerciseDetailPath } from '../../../config/routes'
import { UiText } from '../../../config/labels'

interface ProgramDayCardProps {
  readonly day: WorkoutDay
}

/** One day of the generated program: focus + its exercises and set counts. */
export function ProgramDayCard({ day }: ProgramDayCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-800/40 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-slate-100">{day.focus}</h3>
        <span className="text-xs uppercase tracking-wide text-slate-500">{day.label}</span>
      </div>

      {day.exercises.length === 0 ? (
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
