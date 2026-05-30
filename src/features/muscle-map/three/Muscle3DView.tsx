import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Muscle } from '../../../domain/models/Muscle'
import type { MuscleId } from '../../../domain/enums/MuscleId'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import { ProceduralBody } from './Body3DScene'
import { AnatomyModel } from './AnatomyModel'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { MuscleMapConfig } from '../../../config/muscleMap.config'
import { AnatomyModelConfig } from '../../../config/anatomyModel.config'
import { UiText } from '../../../config/labels'

interface Muscle3DViewProps {
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  readonly selected?: string | null
  readonly onSelect?: (muscleId: MuscleId) => void
  readonly describe?: (muscle: Muscle) => string
}

/**
 * Rotatable 3D muscle view. Renders the realistic anatomy model, with the
 * procedural body as the instant fallback while it loads (and if it errors).
 * Heavy (three.js) — loaded lazily by callers. Default-exported for React.lazy.
 */
export default function Muscle3DView({ muscleIndex, highlight, selected, onSelect, describe }: Muscle3DViewProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const hoveredMuscle = hovered ? muscleIndex.get(hovered) : undefined
  const caption = hoveredMuscle
    ? describe
      ? describe(hoveredMuscle)
      : hoveredMuscle.name
    : UiText.map3dHint

  const bodyProps = { highlight, selected, onSelect, onHover: setHovered }
  const procedural = <ProceduralBody {...bodyProps} />

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        className="aspect-[3/4] w-full max-w-[380px] overflow-hidden rounded-2xl border border-slate-800"
        style={{ background: MuscleMapConfig.model3d.background }}
      >
        <Canvas camera={{ position: [0, 0.1, 4.4], fov: 42 }} dpr={[1, 2]}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 6, 5]} intensity={1.1} />
          <directionalLight position={[-4, 2, -5]} intensity={0.45} />
          <Suspense fallback={procedural}>
            <ModelErrorBoundary fallback={procedural}>
              <AnatomyModel {...bodyProps} />
            </ModelErrorBoundary>
          </Suspense>
          <OrbitControls enablePan={false} enableDamping minDistance={2.6} maxDistance={6} />
        </Canvas>
      </div>
      <p className="h-5 text-center text-sm text-slate-400">{caption}</p>
      <p className="text-center text-[11px] text-slate-600">{AnatomyModelConfig.attribution}</p>
    </div>
  )
}
