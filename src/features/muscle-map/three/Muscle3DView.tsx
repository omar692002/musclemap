import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Muscle } from '../../../domain/models/Muscle'
import type { MuscleId } from '../../../domain/enums/MuscleId'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import { Body3DScene } from './Body3DScene'
import { MuscleMapConfig } from '../../../config/muscleMap.config'
import { UiText } from '../../../config/labels'

interface Muscle3DViewProps {
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  readonly selected?: string | null
  readonly onSelect?: (muscleId: MuscleId) => void
  readonly describe?: (muscle: Muscle) => string
}

/**
 * Rotatable 3D muscle model. Heavy (three.js) — loaded lazily by its callers so
 * it never weighs down the initial bundle. Default-exported for `React.lazy`.
 */
export default function Muscle3DView({ muscleIndex, highlight, selected, onSelect, describe }: Muscle3DViewProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const hoveredMuscle = hovered ? muscleIndex.get(hovered) : undefined
  const caption = hoveredMuscle
    ? describe
      ? describe(hoveredMuscle)
      : hoveredMuscle.name
    : UiText.map3dHint

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        className="aspect-[3/4] w-full max-w-[380px] overflow-hidden rounded-2xl border border-slate-800"
        style={{ background: MuscleMapConfig.model3d.background }}
      >
        <Canvas camera={{ position: [0, 0.1, 4.4], fov: 42 }} dpr={[1, 2]}>
          <Body3DScene highlight={highlight} selected={selected} onSelect={onSelect} onHover={setHovered} />
        </Canvas>
      </div>
      <p className="h-5 text-center text-sm text-slate-400">{caption}</p>
    </div>
  )
}
