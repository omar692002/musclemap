import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { ProgramExercise } from '../domain/models/WorkoutProgram'
import { MediaKind } from '../domain/enums/MediaKind'
import { exerciseDetailPath } from '../config/routes'
import { ExerciseImage } from './ExerciseImage'
import { UiText } from '../config/labels'

/** One exercise row in a day/session: demo thumb + name → detail, sets × reps. */
export function WorkoutExerciseRow({ item }: { item: ProgramExercise }) {
  const { exercise, sets, reps } = item
  const images = exercise.media.filter((media) => media.kind === MediaKind.Image).map((media) => media.url)

  return (
    <li>
      <Link
        to={exerciseDetailPath(exercise.id)}
        className="group flex items-center gap-3 py-2.5"
      >
        <ExerciseImage
          images={images}
          alt={exercise.name}
          className="h-14 w-14 shrink-0 rounded-xl border border-zinc-200/80"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-800 group-hover:text-orange-700">
            {exercise.name}
          </span>
          <span className="block text-xs tabular-nums text-zinc-400">
            {sets > 1 ? `${sets} × ${reps} ${UiText.repsWord}` : reps}
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500 rtl:rotate-180"
          aria-hidden
        />
      </Link>
    </li>
  )
}
