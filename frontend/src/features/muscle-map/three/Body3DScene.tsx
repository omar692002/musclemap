import { useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import type { Muscle } from '../../../domain/models/Muscle'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import type { RegionRef } from '../region'
import type { Body3DShape, MuscleSegment3D, Vec3 } from './geometry3d'
import { BODY_3D, MUSCLES_3D } from './geometry3d'
import { MUSCLE_HEAD_BY_ID } from '../../../data/static/taxonomy/muscleHeads'
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
  const [hovered, setHovered] = useState<string | null>(null)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const colors = MuscleMapConfig.model3d
  const interactive = Boolean(onSelect)
  useCursor(hovered !== null && interactive)

  // A clickable region is a head where the muscle is split (e.g. upper chest),
  // else the whole muscle — keyed the same way the realistic model keys them.
  const regionOf = (s: MuscleSegment3D): RegionRef => {
    const head = s.headId ? MUSCLE_HEAD_BY_ID.get(s.headId) : undefined
    return {
      key: s.headId ?? s.muscleId,
      label: head?.name ?? muscleIndex.get(s.muscleId)?.name ?? s.muscleId,
      muscleId: s.muscleId,
      headId: s.headId,
    }
  }

  return (
    <>
      {BODY_3D.map((shape, index) => (
        <ShapeMesh key={`body-${index}`} shape={shape} color={colors.body} emissive={NO_EMISSIVE} />
      ))}

      {MUSCLES_3D.map((segment, segIndex) => {
        const region = regionOf(segment)
        // Head-keyed highlight matches by region key, falling back to the muscle.
        const role = highlight?.get(region.key) ?? highlight?.get(segment.muscleId)
        const isHovered = hovered === region.key
        const isSelected = selected === region.key || selected === segment.muscleId
        const color = role ? ROLE_FILL[role] : isHovered ? colors.muscleHover : colors.muscle
        const emissive = isSelected ? colors.selected : NO_EMISSIVE

        return (
          <group
            key={`${region.key}-${segIndex}`}
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
                    onSelect?.(region)
                  }
                : undefined
            }
            onPointerOver={
              interactive
                ? (event: ThreeEvent<PointerEvent>) => {
                    event.stopPropagation()
                    setHovered(region.key)
                    onHover?.(region)
                  }
                : undefined
            }
            onPointerOut={
              interactive
                ? () => {
                    setHovered((current) => (current === region.key ? null : current))
                    onHover?.(null)
                  }
                : undefined
            }
          >
            {segment.shapes.map((shape, index) => (
              <ShapeMesh key={`${region.key}-${index}`} shape={shape} color={color} emissive={emissive} />
            ))}
          </group>
        )
      })}
    </>
  )
}
