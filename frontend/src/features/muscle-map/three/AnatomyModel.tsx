import { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { Box3, Group, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import type { Muscle } from '../../../domain/models/Muscle'
import type { MuscleId } from '../../../domain/enums/MuscleId'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import type { RegionRef } from '../region'
import { muscleForChain } from './anatomyMuscleMap'
import { headForChain } from './anatomyHeadMap'
import { MUSCLE_HEAD_BY_ID } from '../../../data/static/taxonomy/muscleHeads'
import { AnatomyModelConfig } from '../../../config/anatomyModel.config'
import { MuscleMapConfig, ROLE_FILL } from '../../../config/muscleMap.config'

interface AnatomyModelProps {
  readonly muscleIndex: ReadonlyMap<string, Muscle>
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  readonly selected?: string | null
  readonly onSelect?: (region: RegionRef) => void
  readonly onHover?: (region: RegionRef | null) => void
}

const NO_EMISSIVE = '#000000'
// Pure connective tissue — hidden to a faint shell so it never veils muscles.
// (Aponeuroses are kept visible: the galea aponeurotica forms the scalp dome.)
const CONNECTIVE = /fascia|retinacul|septum|sheath|bursa|ligament|tendon|trochlea|raphe|membrane/i
// Pointer travel (px) above which a press counts as an orbit drag, not a click.
const DRAG_PX = 6

/** Original-name "self || parent || …" chain (three.js sanitises object.name). */
function chainOf(object: Object3D): string {
  const parts: string[] = []
  let node: Object3D | null = object
  while (node) {
    const raw = (node.userData?.name as string | undefined) || node.name
    if (raw) parts.push(raw)
    node = node.parent
  }
  return parts.join(' || ')
}

/** Climbs from a hit object to the nearest ancestor carrying a region. */
function pickRegion(object: Object3D): RegionRef | null {
  let node: Object3D | null = object
  while (node) {
    const region = node.userData?.region as RegionRef | undefined
    if (region) return region
    node = node.parent
  }
  return null
}

/**
 * The realistic anatomy model (GLTF). Each mesh is resolved to a muscle *head*
 * where the muscle is split (else the whole muscle), tagged with that region,
 * and given its own material so it can be recoloured by role/hover. Connective
 * tissue is ghosted and ignored by raycasts. Auto-fitted (centre + scale).
 */
export function AnatomyModel({ muscleIndex, highlight, selected, onSelect, onHover }: AnatomyModelProps) {
  const { scene } = useGLTF(AnatomyModelConfig.url)
  const [hovered, setHovered] = useState<string | null>(null)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const interactive = Boolean(onSelect)
  useCursor(hovered !== null && interactive)

  const fitted = useMemo(() => {
    const colors = MuscleMapConfig.model3d
    const root = scene.clone(true)
    root.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const chain = chainOf(mesh)
      const headId = headForChain(chain)
      const head = headId ? MUSCLE_HEAD_BY_ID.get(headId) : undefined
      const muscleId = head ? head.parent : muscleForChain(chain)
      mesh.userData.muscleId = muscleId

      const material = new MeshStandardMaterial({ roughness: 0.6, metalness: 0.05 })
      if (muscleId) {
        const region: RegionRef = {
          key: headId ?? muscleId,
          label: head ? head.name : muscleIndex.get(muscleId)?.name ?? muscleId,
          muscleId,
          headId: headId ?? undefined,
        }
        mesh.userData.region = region
      } else if (CONNECTIVE.test(chain)) {
        // Fascia/tendon/etc.: faint see-through shell that never veils muscles.
        material.transparent = true
        material.opacity = colors.fasciaOpacity
        material.depthWrite = false
        material.color.set(colors.fascia)
        mesh.renderOrder = -1
        mesh.raycast = () => {}
      } else {
        // Unmapped body part (head/feet/hands, deep muscles): solid neutral so
        // the figure looks complete; not clickable.
        material.color.set(colors.inactive)
        mesh.raycast = () => {}
      }
      mesh.material = material
    })

    const box = new Box3().setFromObject(root)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    root.position.sub(center)
    const group = new Group()
    group.add(root)
    group.scale.setScalar(AnatomyModelConfig.targetHeight / Math.max(size.y, 0.0001))
    return group
  }, [scene, muscleIndex])

  useEffect(() => {
    const colors = MuscleMapConfig.model3d
    // In highlight mode (e.g. an exercise's worked muscles) everything that
    // isn't targeted is dimmed so only the relevant muscles stand out.
    const highlightActive = Boolean(highlight && highlight.size > 0)
    fitted.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const muscleId = mesh.userData.muscleId as MuscleId | null
      if (!muscleId) return // ghosted tissue keeps its faint material
      const region = mesh.userData.region as RegionRef | undefined
      const material = mesh.material as MeshStandardMaterial
      // Head-keyed highlights match by region.key (headId); a muscle-keyed
      // highlight falls through to the whole-muscle id so it still lights up.
      const role = (region ? highlight?.get(region.key) : undefined) ?? highlight?.get(muscleId)
      const isSelected = selected === muscleId
      const isHovered = region ? hovered === region.key : false
      const color = role
        ? ROLE_FILL[role]
        : highlightActive
          ? colors.inactive
          : isHovered
            ? colors.muscleHover
            : colors.muscle
      material.color.set(color)
      material.emissive.set(isSelected ? colors.selected : NO_EMISSIVE)
      material.emissiveIntensity = isSelected ? 0.5 : 0
    })
  }, [fitted, highlight, selected, hovered])

  return (
    <primitive
      object={fitted}
      onPointerMove={
        interactive
          ? (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation()
              const region = pickRegion(event.object)
              setHovered(region?.key ?? null)
              onHover?.(region ?? null)
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              setHovered(null)
              onHover?.(null)
            }
          : undefined
      }
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
              // Ignore the click that ends an orbit drag (pointer moved a lot).
              if (start && Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y) > DRAG_PX) {
                return
              }
              const region = pickRegion(event.object)
              if (region) onSelect?.(region)
            }
          : undefined
      }
    />
  )
}

useGLTF.preload(AnatomyModelConfig.url)
