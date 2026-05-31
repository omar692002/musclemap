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
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-800/40 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-slate-100">{DAY_FOCUS_LABELS[day.focus]}</h3>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {UiText.dayWord} {day.index}
        </span>
      </div>

      {hasExercises ? (
        <>
          <div className="mb-3">
            <WarmupBlock />
          </div>
          <ul className="flex flex-col divide-y divide-slate-800">
            {day.exercises.map((item) => (
              <WorkoutExerciseRow key={item.exercise.id} item={item} />
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-slate-500">{UiText.emptyDay}</p>
      )}
    </div>
  )
}
