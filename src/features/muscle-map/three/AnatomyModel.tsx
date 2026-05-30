import { useEffect, useMemo, useState } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three'
import type { MuscleId } from '../../../domain/enums/MuscleId'
import type { MuscleRole } from '../../../domain/enums/MuscleRole'
import { muscleForChain } from './anatomyMuscleMap'
import { AnatomyModelConfig } from '../../../config/anatomyModel.config'
import { MuscleMapConfig, ROLE_FILL } from '../../../config/muscleMap.config'

interface AnatomyModelProps {
  readonly highlight?: ReadonlyMap<string, MuscleRole>
  readonly selected?: string | null
  readonly onSelect?: (muscleId: MuscleId) => void
  readonly onHover?: (muscleId: MuscleId | null) => void
}

const NO_EMISSIVE = '#000000'

/** Lower-cased "self || parent || …" chain used to resolve a mesh's muscle. */
function chainOf(object: Object3D): string {
  const parts: string[] = []
  let node: Object3D | null = object
  while (node) {
    if (node.name) parts.push(node.name)
    node = node.parent
  }
  return parts.join(' || ').toLowerCase()
}

/** Climbs from a clicked object to the nearest ancestor carrying a muscle id. */
function pickMuscle(object: Object3D): MuscleId | null {
  let node: Object3D | null = object
  while (node) {
    const id = node.userData?.muscleId as MuscleId | null | undefined
    if (id) return id
    node = node.parent
  }
  return null
}

/**
 * The realistic anatomy model (GLTF). Each mesh is tagged with the muscle id it
 * belongs to (via `anatomyMuscleMap`), gets its own material so it can be
 * recoloured by role/hover/selection, and the whole model is auto-fitted
 * (centred + scaled) to the scene. Same contract as the procedural body.
 */
export function AnatomyModel({ highlight, selected, onSelect, onHover }: AnatomyModelProps) {
  const { scene } = useGLTF(AnatomyModelConfig.url)
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const interactive = Boolean(onSelect)
  useCursor(hovered !== null && interactive)

  const fitted = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const muscleId = muscleForChain(chainOf(mesh))
      mesh.userData.muscleId = muscleId
      mesh.material = new MeshStandardMaterial({ roughness: 0.65, metalness: 0.05 })
    })

    // Centre at the origin and scale to a consistent height.
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
  }, [scene])

  useEffect(() => {
    const colors = MuscleMapConfig.model3d
    fitted.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const material = mesh.material as MeshStandardMaterial
      const muscleId = mesh.userData.muscleId as MuscleId | null
      if (!muscleId) {
        material.color.set(colors.body)
        material.emissive.set(NO_EMISSIVE)
        material.emissiveIntensity = 0
        return
      }
      const role = highlight?.get(muscleId)
      const isSelected = selected === muscleId
      const isHovered = hovered === muscleId
      material.color.set(role ? ROLE_FILL[role] : isHovered ? colors.muscleHover : colors.muscle)
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
              const id = pickMuscle(event.object)
              setHovered(id)
              onHover?.(id)
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
      onClick={
        interactive
          ? (event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation()
              const id = pickMuscle(event.object)
              if (id) onSelect?.(id)
            }
          : undefined
      }
    />
  )
}

useGLTF.preload(AnatomyModelConfig.url)
