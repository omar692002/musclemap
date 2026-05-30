import { Link } from 'react-router-dom'
import type { Exercise } from '../../../domain/models/Exercise'
import type { Muscle } from '../../../domain/models/Muscle'
import { Badge } from '../../../components/Badge'
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '../../../config/labels'
import { primaryGroupsOf } from '../exerciseMuscles'
import { coverImageOf } from '../media'
import { exerciseDetailPath } from '../../../config/routes'

interface ExerciseCardProps {
  readonly exercise: Exercise
  readonly muscleIndex: ReadonlyMap<string, Muscle>
}

/** A tappable summary card linking to the exercise detail page. */
export function ExerciseCard({ exercise, muscleIndex }: ExerciseCardProps) {
  const primaryGroups = primaryGroupsOf(exercise, muscleIndex)
  const cover = coverImageOf(exercise)

  return (
    <Link
      to={exerciseDetailPath(exercise.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-800/40 transition hover:border-slate-600 hover:bg-slate-800"
    >
      <div className="aspect-video overflow-hidden bg-slate-900">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h2 className="text-sm font-semibold leading-snug text-slate-100">{exercise.name}</h2>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {primaryGroups.map((group) => (
            <Badge key={group} tone="primary">
              {MUSCLE_GROUP_LABELS[group]}
            </Badge>
          ))}
          {exercise.equipment ? (
            <Badge tone="neutral">{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
