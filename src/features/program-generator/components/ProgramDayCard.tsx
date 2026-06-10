import type { WorkoutDay } from '../../../domain/models/WorkoutProgram'
import { UiText, DAY_FOCUS_LABELS } from '../../../config/labels'
import { WarmupBlock } from '../../../components/WarmupBlock'
import { WorkoutExerciseRow } from '../../../components/WorkoutExerciseRow'

interface ProgramDayCardProps {
  readonly day: WorkoutDay
}

/** One day of the generated program: focus + a warm-up + its exercises/reps. */
export function ProgramDayCard({ day }: ProgramDayCardProps) {
  const hasExercises = day.exercises.length > 0
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-zinc-900">{DAY_FOCUS_LABELS[day.focus]}</h3>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {UiText.dayWord} {day.index}
        </span>
      </div>

      {hasExercises ? (
        <>
          <div className="mb-3">
            <WarmupBlock />
          </div>
          <ul className="flex flex-col divide-y divide-zinc-100">
            {day.exercises.map((item) => (
              <WorkoutExerciseRow key={item.exercise.id} item={item} />
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-zinc-400">{UiText.emptyDay}</p>
      )}
    </div>
  )
}
