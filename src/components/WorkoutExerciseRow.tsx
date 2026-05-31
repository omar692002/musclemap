import { Link } from 'react-router-dom'
import type { ProgramExercise } from '../domain/models/WorkoutProgram'
import { exerciseDetailPath } from '../config/routes'

/** One exercise row in a day/session: name → detail, with its sets × reps. */
export function WorkoutExerciseRow({ item }: { item: ProgramExercise }) {
  const { exercise, sets, reps } = item
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <Link to={exerciseDetailPath(exercise.id)} className="text-sm text-slate-200 hover:text-sky-300">
        {exercise.name}
      </Link>
      <span className="shrink-0 text-xs tabular-nums text-slate-400">
        {sets > 1 ? `${sets} × ${reps}` : reps}
      </span>
    </li>
  )
}
