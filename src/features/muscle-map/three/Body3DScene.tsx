import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import type { Muscle } from '../../../domain/models/Muscle'
import type { MuscleId } from '../../../domain/enums/MuscleId'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import type { RegionRef } from '../region'
import type { Body3DShape, Vec3 } from './geometry3d'
import { BODY_3D, MUSCLES_3D } from './geometry3d'
import { MuscleMapConfig, ROLE_FILL } from '../../../config/muscleMap.config'

interface ProceduralBodyProps {
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  readonly selected?: string | null
  readonly onSelect?: (region: RegionRef) => void
  readonly onHover?: (region: RegionRef | null) => void
}

const NO_EMISSIVE = '#000000'
const tuple = (v: Vec3): [number, number, number] => [v[0], v[1], v[2]]

function ShapeMesh({ shape, color, emissive }: { shape: Body3DShape; color: string; emissive: string }) {
  const material = (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissive === NO_EMISSIVE ? 0 : 0.5}
      roughness={0.6}
      metalness={0.05}
    />
  )
  switch (shape.kind) {
    case 'sphere':
      return (
        <mesh position={tuple(shape.position)} scale={shape.scale ? tuple(shape.scale) : undefined}>
          <sphereGeometry args={[shape.radius, 24, 24]} />
          {material}
        </mesh>
      )
    case 'capsule':
      return (
        <mesh position={tuple(shape.position)} rotation={shape.rotation ? tuple(shape.rotation) : undefined}>
          <capsuleGeometry args={[shape.radius, shape.length, 6, 16]} />
          {material}
        </mesh>
      )
    case 'box':
      return (
        <mesh position={tuple(shape.position)} rotation={shape.rotation ? tuple(shape.rotation) : undefined}>
          <boxGeometry args={tuple(shape.size)} />
          {material}
        </mesh>
      )
  }
}

/**
 * The procedural mannequin: a stylised body + clickable muscle groups. Used as
 * the instant fallback while the realistic anatomy model loads (and if it fails
 * to load). Lights/controls live in the parent so both bodies share them.
 */
const DRAG_PX = 6

export function ProceduralBody({ muscleIndex, highlight, selected, onSelect, onHover }: ProceduralBodyProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const colors = MuscleMapConfig.model3d
  const interactive = Boolean(onSelect)
  useCursor(hovered !== null && interactive)

  // The mannequin is muscle-level (no heads); a region is the whole muscle.
  const regionOf = (muscleId: MuscleId): RegionRef => ({
    key: muscleId,
    label: muscleIndex.get(muscleId)?.name ?? muscleId,
    muscleId,
  })

  return (
    <>
      {BODY_3D.map((shape, index) => (
        <ShapeMesh key={`body-${index}`} shape={shape} color={colors.body} emissive={NO_EMISSIVE} />
      ))}

      {MUSCLES_3D.map((segment) => {
        const role = highlight?.get(segment.muscleId)
        const isHovered = hovered === segment.muscleId
        const isSelected = selected === segment.muscleId
        const color = role ? ROLE_FILL[role] : isHovered ? colors.muscleHover : colors.muscle
        const emissive = isSelected ? colors.selected : NO_EMISSIVE

        return (
          <group
            key={segment.muscleId}
            onPointerDown={
              interactive
                ? (event: ThreeEvent<PointerEvent>) => {
                    pressStart.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
                  }
                : undefined
            }
            onClick={
              interactive
                ? (event: ThreeEvent<MouseEvent>) => {
                    event.stopPropagation()
                    const start = pressStart.current
                    pressStart.current = null
                    if (start && Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y) > DRAG_PX) {
                      return
                    }
                    onSelect?.(regionOf(segment.muscleId))
                  }
                : undefined
            }
            onPointerOver={
              interactive
                ? (event: ThreeEvent<PointerEvent>) => {
                    event.stopPropagation()
                    setHovered(segment.muscleId)
                    onHover?.(regionOf(segment.muscleId))
                  }
                : undefined
            }
            onPointerOut={
              interactive
                ? () => {
                    setHovered((current) => (current === segment.muscleId ? null : current))
                    onHover?.(null)
                  }
                : undefined
            }
          >
            {segment.shapes.map((shape, index) => (
              <ShapeMesh key={`${segment.muscleId}-${index}`} shape={shape} color={color} emissive={emissive} />
            ))}
          </group>
        )
      })}
    </>
  )
}
