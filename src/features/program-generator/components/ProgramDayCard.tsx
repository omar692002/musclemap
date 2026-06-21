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
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-subtle/60 p-4 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">{weekday}</span>
        <Moon className="h-5 w-5 text-faint" aria-hidden />
        <span className="text-sm font-semibold text-muted">{DAY_FOCUS_LABELS[day.focus]}</span>
        <span className="text-xs text-faint">{UiText.restDayHint}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-ink">{DAY_FOCUS_LABELS[day.focus]}</h3>
        <span className="rounded-full bg-subtle px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {weekday}
        </span>
      </div>

      {day.exercises.length > 0 ? (
        <>
          <div className="mb-3">
            <WarmupBlock />
          </div>
          <ul className="flex flex-col divide-y divide-line">
            {day.exercises.map((item) => (
              <WorkoutExerciseRow key={item.exercise.id} item={item} />
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-faint">{UiText.emptyDay}</p>
      )}
    </div>
  )
}
