import type { MuscleGroup } from '../../../domain/enums/MuscleGroup'
import { MUSCLE_GROUP_LABELS, UiText } from '../../../config/labels'

interface VolumeReadoutProps {
  readonly volumeByGroup: ReadonlyMap<MuscleGroup, number>
}

/** Weekly effective-sets-per-muscle-group bars (descending). */
export function VolumeReadout({ volumeByGroup }: VolumeReadoutProps) {
  const rows = [...volumeByGroup.entries()].filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1])
  if (rows.length === 0) return null
  const max = rows[0][1]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-100">{UiText.weeklyVolume}</h3>
      <ul className="flex flex-col gap-2">
        {rows.map(([group, value]) => (
          <li key={group} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-slate-400">{MUSCLE_GROUP_LABELS[group]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right text-xs tabular-nums text-slate-300">
              {Math.round(value * 10) / 10}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
