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
      <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-surface to-sky-500/5 p-4 shadow-sm">
        {/* Soft glow so the rest day reads as a calm, intentional part of the week. */}
        <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-500 ring-1 ring-inset ring-indigo-500/20">
          <Moon className="h-6 w-6" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500/80">{weekday}</span>
          <span className="text-base font-bold text-ink">{DAY_FOCUS_LABELS[day.focus]}</span>
          <span className="text-xs text-muted">{UiText.restDayHint}</span>
        </div>
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
