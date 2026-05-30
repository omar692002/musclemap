import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleId } from '../../domain/enums/MuscleId'
import type { MuscleRole } from '../../domain/enums/MuscleRole'
import { BodyView } from '../../domain/enums/BodyView'
import { BodyDiagram } from './BodyDiagram'
import { MuscleMapLegend } from './MuscleMapLegend'
import { rolesInHighlight } from './highlight'
import { BODY_VIEW_LABELS } from '../../config/labels'

interface MuscleMapBoardProps {
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  readonly selected?: string | null
  readonly onSelect?: (muscleId: MuscleId) => void
  readonly describe?: (muscle: Muscle) => string
}

const VIEWS: readonly BodyView[] = [BodyView.Front, BodyView.Back]

/** Front + back figures side by side, with a colour legend when highlighted. */
export function MuscleMapBoard({ muscleIndex, highlight, selected, onSelect, describe }: MuscleMapBoardProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-start justify-center gap-2 sm:gap-6">
        {VIEWS.map((view) => (
          <figure key={view} className="flex flex-1 flex-col items-center gap-1">
            <BodyDiagram
              view={view}
              muscleIndex={muscleIndex}
              highlight={highlight}
              selected={selected}
              onSelect={onSelect}
              describe={describe}
            />
            <figcaption className="text-xs uppercase tracking-wide text-slate-500">
              {BODY_VIEW_LABELS[view]}
            </figcaption>
          </figure>
        ))}
      </div>
      {highlight ? <MuscleMapLegend roles={rolesInHighlight(highlight)} /> : null}
    </div>
  )
}
