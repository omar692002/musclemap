import { Moon } from 'lucide-react'
import type { WorkoutDay } from '../../../domain/models/WorkoutProgram'
import { DAY_FOCUS_LABELS, WEEKDAY_LABELS, UiText } from '../../../config/labels'
import { WarmupBlock } from '../../../components/WarmupBlock'
import { WorkoutExerciseRow } from '../../../components/WorkoutExerciseRow'

interface ProgramDayCardProps {
  readonly day: WorkoutDay
}

/** One day of the generated week: a rest day, or a focus + warm-up + exercises. */
export function ProgramDayCard({ day }: ProgramDayCardProps) {
  const weekday = WEEKDAY_LABELS[day.weekday]

  if (day.isRest) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-4 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{weekday}</span>
        <Moon className="h-5 w-5 text-zinc-400" aria-hidden />
        <span className="text-sm font-semibold text-zinc-500">{DAY_FOCUS_LABELS[day.focus]}</span>
        <span className="text-xs text-zinc-400">{UiText.restDayHint}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-zinc-900">{DAY_FOCUS_LABELS[day.focus]}</h3>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {weekday}
        </span>
      </div>

      {day.exercises.length > 0 ? (
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
