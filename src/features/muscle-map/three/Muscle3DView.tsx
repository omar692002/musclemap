import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Muscle } from '../../../domain/models/Muscle'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import type { RegionRef } from '../region'
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
  readonly onSelect?: (region: RegionRef) => void
  /** Exercise count for a region key (muscle or head), shown on hover. */
  readonly countFor?: (regionKey: string) => number
}

/**
 * Rotatable 3D muscle view. Renders the realistic anatomy model (split into
 * muscle heads), with the procedural body as the instant fallback while it
 * loads (and if it errors). Heavy (three.js) — loaded lazily by callers.
 */
export default function Muscle3DView({ muscleIndex, highlight, selected, onSelect, countFor }: Muscle3DViewProps) {
  const [hovered, setHovered] = useState<RegionRef | null>(null)
  const caption = hovered
    ? `${hovered.label}${countFor ? ` · ${countFor(hovered.key)} ${UiText.exercisesWord}` : ''}`
    : UiText.map3dHint

  const bodyProps = { muscleIndex, highlight, selected, onSelect, onHover: setHovered }
  const procedural = <ProceduralBody {...bodyProps} />

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        className="aspect-[3/4] w-full max-w-[380px] overflow-hidden rounded-2xl border border-slate-800"
        style={{ background: MuscleMapConfig.model3d.background }}
      >
        <Canvas camera={{ position: [0, 0, 4.7], fov: 42 }} dpr={[1, 2]}>
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
