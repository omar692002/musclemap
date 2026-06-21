import { ShieldCheck, AlertTriangle } from 'lucide-react'
import type { GroupRecovery } from '../../../domain/models/WorkoutProgram'
import { RecoveryStatus } from '../../../domain/enums/RecoveryStatus'
import { MUSCLE_GROUP_LABELS, RECOVERY_STATUS_LABELS, UiText } from '../../../config/labels'

interface RecoveryReadoutProps {
  readonly recovery: readonly GroupRecovery[]
}

/** Per-group recovery: weekly frequency + a well-recovered / overlap status (EM5). */
export function RecoveryReadout({ recovery }: RecoveryReadoutProps) {
  if (recovery.length === 0) return null

  return (
    <div className="rounded-2xl border border-line/80 bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-bold text-ink">{UiText.recoveryTitle}</h3>
      <p className="mb-3 text-xs text-muted">{UiText.recoveryHelp}</p>
      <ul className="flex flex-col gap-2">
        {recovery.map((row) => {
          const optimal = row.status === RecoveryStatus.Optimal
          return (
            <li key={row.group} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-muted">
                {MUSCLE_GROUP_LABELS[row.group]}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-faint">
                {row.sessionsPerWeek}
                {UiText.perWeekUnit}
              </span>
              <span
                className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  optimal ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {optimal ? (
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                ) : (
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                )}
                {RECOVERY_STATUS_LABELS[row.status]}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
