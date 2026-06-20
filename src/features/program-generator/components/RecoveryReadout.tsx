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
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-900">{UiText.recoveryTitle}</h3>
      <p className="mb-3 text-xs text-zinc-500">{UiText.recoveryHelp}</p>
      <ul className="flex flex-col gap-2">
        {recovery.map((row) => {
          const optimal = row.status === RecoveryStatus.Optimal
          return (
            <li key={row.group} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-zinc-500">
                {MUSCLE_GROUP_LABELS[row.group]}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-400">
                {row.sessionsPerWeek}
                {UiText.perWeekUnit}
              </span>
              <span
                className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  optimal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
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
