import type { Exercise } from '../../../domain/models/Exercise'
import type { Muscle } from '../../../domain/models/Muscle'
import { MuscleRole } from '../../../domain/enums/MuscleRole'
import { Badge } from '../../../components/Badge'
import type { BadgeTone } from '../../../components/Badge'
import { MUSCLE_ROLE_LABELS } from '../../../config/labels'
import { involvementsByRole } from '../exerciseMuscles'

/** Roles shown, in order. Source data carries Primary/Secondary; Stabilizer
 *  appears only once curated, and is rendered if present. */
const ROLE_ORDER: readonly MuscleRole[] = [
  MuscleRole.Primary,
  MuscleRole.Secondary,
  MuscleRole.Stabilizer,
]

const ROLE_TONE: Readonly<Record<MuscleRole, BadgeTone>> = {
  [MuscleRole.Primary]: 'primary',
  [MuscleRole.Secondary]: 'secondary',
  [MuscleRole.Stabilizer]: 'accent',
}

interface MuscleInvolvementListProps {
  readonly exercise: Exercise
  readonly muscleIndex: ReadonlyMap<string, Muscle>
}

/** Muscles worked, grouped by role, with each muscle shown as a labelled badge. */
export function MuscleInvolvementList({ exercise, muscleIndex }: MuscleInvolvementListProps) {
  return (
    <div className="flex flex-col gap-3">
      {ROLE_ORDER.map((role) => {
        const entries = involvementsByRole(exercise, role, muscleIndex)
        if (entries.length === 0) return null
        return (
          <div key={role} className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {MUSCLE_ROLE_LABELS[role]}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entries.map(({ muscle }) => (
                <Badge key={muscle.id} tone={ROLE_TONE[role]}>
                  {muscle.name}
                </Badge>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
