import { describe, it, expect } from 'vitest'
import { MuscleId } from '../../../domain/enums/MuscleId'
import { ANATOMY_RULES, muscleForChain } from '../three/anatomyMuscleMap'

// Representative ancestor chains from the BodyParts3D / Z-Anatomy model.
const CASES: ReadonlyArray<readonly [string, MuscleId]> = [
  ['long head of biceps brachii.l || anterior compartment of arm.g', MuscleId.BicepsBrachii],
  ['long head of biceps femoris.r || posterior compartment of thigh.g', MuscleId.Hamstrings],
  ['lateral head of triceps brachii.l || posterior compartment of arm.g', MuscleId.TricepsBrachii],
  ['clavicular head of pectoralis major muscle.l', MuscleId.PectoralisMajor],
  ['gluteus maximus muscle.l || superficial gluteal muscles.g', MuscleId.Gluteus],
  ['gluteus medius muscle.r || deep gluteal muscles.g', MuscleId.HipAbductors],
  ['adductor longus.l || medial compartment of thigh.g', MuscleId.HipAdductors],
  ['vastus lateralis muscle.l || anterior compartment of thigh.g', MuscleId.Quadriceps],
  ['lateral head of gastrocnemius.l || posterior compartment of leg.g', MuscleId.Calves],
  ['flexor carpi radialis.l || anterior compartment of forearm.g', MuscleId.Forearms],
  ['latissimus dorsi muscle.r', MuscleId.LatissimusDorsi],
  ['rectus abdominis muscle.l || muscles of abdomen.g', MuscleId.RectusAbdominis],
  ['sternocleidomastoid muscle.l || muscles of neck.g', MuscleId.Neck],
  // three.js sanitises names on load (spaces → "_", dots dropped) — must still map.
  ['Long_head_of_biceps_brachiil || Anterior_compartment_of_arm', MuscleId.BicepsBrachii],
  ['Vastus_lateralis_musclel || Anterior_compartment_of_thigh', MuscleId.Quadriceps],
]

describe('anatomy mesh → muscle mapping', () => {
  it.each(CASES)('maps "%s"', (chain, expected) => {
    expect(muscleForChain(chain)).toBe(expected)
  })

  it('leaves unrelated tissue unmapped', () => {
    expect(muscleForChain('palmar aponeurosis.l || fasciae of upper limb.g')).toBeNull()
    expect(muscleForChain('adductor pollicis.l || muscles of hand.g')).toBeNull()
  })

  it('has at least one rule for every muscle in the taxonomy', () => {
    const covered = new Set(ANATOMY_RULES.map((rule) => rule.muscleId))
    const missing = Object.values(MuscleId).filter((id) => !covered.has(id))
    expect(missing).toEqual([])
  })
})
