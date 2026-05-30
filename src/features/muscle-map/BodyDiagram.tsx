import type { CSSProperties, KeyboardEvent } from 'react'
import type { Muscle } from '../../domain/models/Muscle'
import type { MuscleId } from '../../domain/enums/MuscleId'
import type { MuscleRole } from '../../domain/enums/MuscleRole'
import { BodyView } from '../../domain/enums/BodyView'
import type { BodyShape } from './geometry/shapes'
import { BODY_SILHOUETTE, regionsForView } from './geometry/bodyGeometry'
import { MuscleMapConfig, ROLE_FILL } from '../../config/muscleMap.config'
import { BODY_VIEW_LABELS } from '../../config/labels'

interface BodyDiagramProps {
  readonly view: BodyView
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  /** muscleId -> role to colour it by (e.g. an exercise's worked muscles). */
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  /** Currently selected muscle id (drawn with an accent outline). */
  readonly selected?: string | null
  /** When provided, regions become clickable buttons. */
  readonly onSelect?: (muscleId: MuscleId) => void
  /** Extra text for a region's tooltip/aria label (defaults to the name). */
  readonly describe?: (muscle: Muscle) => string
}

const ENTER_KEYS = new Set(['Enter', ' '])

function renderShape(shape: BodyShape, key: string, style: CSSProperties) {
  switch (shape.kind) {
    case 'ellipse':
      return <ellipse key={key} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} style={style} />
    case 'rect':
      return (
        <rect key={key} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.r} ry={shape.r} style={style} />
      )
    case 'poly':
      return <polygon key={key} points={shape.points.map((point) => point.join(',')).join(' ')} style={style} />
  }
}

/** One body figure (front or back): silhouette + interactive muscle regions. */
export function BodyDiagram({ view, muscleIndex, highlight, selected, onSelect, describe }: BodyDiagramProps) {
  const { colors, strokeWidth, selectedStrokeWidth, viewBox } = MuscleMapConfig
  const interactive = Boolean(onSelect)
  const silhouetteStyle: CSSProperties = { fill: colors.silhouette, stroke: colors.regionStroke, strokeWidth }

  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full max-w-[240px]"
      role="img"
      aria-label={BODY_VIEW_LABELS[view]}
      style={{ strokeLinejoin: 'round' }}
    >
      <g>{BODY_SILHOUETTE.map((shape, index) => renderShape(shape, `sil-${index}`, silhouetteStyle))}</g>

      {regionsForView(view).map((reg) => {
        const muscle = muscleIndex.get(reg.muscleId)
        const role = highlight?.get(reg.muscleId)
        const isSelected = selected === reg.muscleId
        const style: CSSProperties = {
          fill: role ? ROLE_FILL[role] : colors.region,
          stroke: isSelected ? colors.selectedStroke : colors.regionStroke,
          strokeWidth: isSelected ? selectedStrokeWidth : strokeWidth,
        }
        const label = muscle ? (describe ? describe(muscle) : muscle.name) : reg.muscleId
        const onKeyDown = interactive
          ? (event: KeyboardEvent<SVGGElement>) => {
              if (ENTER_KEYS.has(event.key)) {
                event.preventDefault()
                onSelect?.(reg.muscleId)
              }
            }
          : undefined

        return (
          <g
            key={`${view}-${reg.muscleId}`}
            onClick={interactive ? () => onSelect?.(reg.muscleId) : undefined}
            onKeyDown={onKeyDown}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? label : undefined}
            className={
              interactive
                ? 'cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-70'
                : undefined
            }
          >
            <title>{label}</title>
            {reg.shapes.map((shape, index) => renderShape(shape, `${reg.muscleId}-${index}`, style))}
          </g>
        )
      })}
    </svg>
  )
}
