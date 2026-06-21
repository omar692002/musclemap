import type { ProgressionPlan } from '../../../domain/models/WorkoutProgram'
import { PROGRESSION_STEP_LABELS, UiText } from '../../../config/labels'

interface ProgressionPlanCardProps {
  readonly plan: ProgressionPlan
}

/** The goal-aware 4-week progressive-overload plan (EM5). */
export function ProgressionPlanCard({ plan }: ProgressionPlanCardProps) {
  return (
    <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-bold text-ink">{UiText.progressionTitle}</h3>
      <p className="mb-3 text-xs text-muted">{UiText.progressionHelp}</p>
      <ol className="flex flex-col gap-2">
        {plan.weeks.map((week) => (
          <li key={week.week} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-600">
              {week.week}
            </span>
            <span className="text-sm text-muted">{PROGRESSION_STEP_LABELS[week.step]}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
