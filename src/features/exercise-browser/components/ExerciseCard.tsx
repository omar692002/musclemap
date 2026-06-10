import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { Exercise } from '../../../domain/models/Exercise'
import type { Muscle } from '../../../domain/models/Muscle'
import { Badge } from '../../../components/Badge'
import { ExerciseImage } from '../../../components/ExerciseImage'
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '../../../config/labels'
import { primaryGroupsOf } from '../exerciseMuscles'
import { imageUrlsOf, hasVideo } from '../media'
import { exerciseDetailPath } from '../../../config/routes'

interface ExerciseCardProps {
  readonly exercise: Exercise
  readonly muscleIndex: ReadonlyMap<string, Muscle>
}

/** A tappable summary card (with a looping two-frame demo) linking to detail. */
export function ExerciseCard({ exercise, muscleIndex }: ExerciseCardProps) {
  const primaryGroups = primaryGroupsOf(exercise, muscleIndex)
  const images = imageUrlsOf(exercise)
  const video = hasVideo(exercise)

  return (
    <Link
      to={exerciseDetailPath(exercise.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-zinc-100 bg-white">
        <ExerciseImage images={images} alt="" className="h-full w-full" />
        {video ? (
          <span
            aria-hidden
            className="absolute bottom-2 end-2 grid h-6 w-6 place-items-center rounded-full bg-zinc-900/70 text-white backdrop-blur"
          >
            <Play className="h-3 w-3" />
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">{exercise.name}</h2>
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
