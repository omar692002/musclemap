import type { MuscleRole } from '../../domain/enums/MuscleRole'
import { ROLE_FILL } from '../../config/muscleMap.config'
import { MUSCLE_ROLE_LABELS } from '../../config/labels'

interface MuscleMapLegendProps {
  readonly roles: readonly MuscleRole[]
}

/** Colour key for a highlighted map (Primary / Secondary / Stabilizer). */
export function MuscleMapLegend({ roles }: MuscleMapLegendProps) {
  if (roles.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {roles.map((role) => (
        <span key={role} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: ROLE_FILL[role] }}
            aria-hidden
          />
          {MUSCLE_ROLE_LABELS[role]}
        </span>
      ))}
    </div>
  )
}
