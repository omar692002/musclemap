import { MuscleGroup } from '../domain/enums/MuscleGroup'

/**
 * Tunable model behind Advanced Muscle Intelligence (EM8). Centralised here so
 * the fatigue / recovery / volume heuristics have no magic numbers scattered
 * across the engine, and the science is reviewable in one place.
 *
 * **Weekly volume landmarks** (effective sets per muscle group per week) follow
 * the now-standard MEV / MAV / MRV framing popularised by Renaissance
 * Periodization (Israetel et al.):
 *  - **MEV** — Minimum Effective Volume: the least volume that still drives growth.
 *  - **MAV** — Maximum Adaptive Volume: the productive ceiling for most lifters.
 *  - **MRV** — Maximum Recoverable Volume: beyond this, fatigue outpaces recovery.
 * The figures below are mid-range defaults for an intermediate trainee; they are
 * deliberately a transparent model, not a per-user prescription.
 */
export interface VolumeLandmarks {
  readonly mev: number
  readonly mav: number
  readonly mrv: number
}

export interface GroupModel {
  readonly landmarks: VolumeLandmarks
  /** Base hours to fully recover from a typical session for this group. */
  readonly recoveryHours: number
}

/**
 * Per-group model. Exhaustive over {@link MuscleGroup} (the `Record` makes a
 * missing entry a compile error); the screen displays the curated
 * {@link INTEL_GROUPS} subset.
 */
export const GROUP_MODELS: Readonly<Record<MuscleGroup, GroupModel>> = {
  [MuscleGroup.Chest]: { landmarks: { mev: 10, mav: 16, mrv: 22 }, recoveryHours: 48 },
  [MuscleGroup.Back]: { landmarks: { mev: 10, mav: 18, mrv: 25 }, recoveryHours: 56 },
  [MuscleGroup.Shoulders]: { landmarks: { mev: 8, mav: 16, mrv: 22 }, recoveryHours: 48 },
  [MuscleGroup.Biceps]: { landmarks: { mev: 8, mav: 14, mrv: 20 }, recoveryHours: 48 },
  [MuscleGroup.Triceps]: { landmarks: { mev: 8, mav: 14, mrv: 18 }, recoveryHours: 48 },
  [MuscleGroup.Forearms]: { landmarks: { mev: 6, mav: 10, mrv: 16 }, recoveryHours: 36 },
  [MuscleGroup.Core]: { landmarks: { mev: 8, mav: 16, mrv: 25 }, recoveryHours: 24 },
  [MuscleGroup.Quadriceps]: { landmarks: { mev: 8, mav: 16, mrv: 20 }, recoveryHours: 60 },
  [MuscleGroup.Hamstrings]: { landmarks: { mev: 6, mav: 14, mrv: 20 }, recoveryHours: 60 },
  [MuscleGroup.Glutes]: { landmarks: { mev: 4, mav: 12, mrv: 16 }, recoveryHours: 48 },
  [MuscleGroup.Calves]: { landmarks: { mev: 8, mav: 16, mrv: 22 }, recoveryHours: 36 },
  [MuscleGroup.Neck]: { landmarks: { mev: 4, mav: 8, mrv: 12 }, recoveryHours: 24 },
  [MuscleGroup.Adductors]: { landmarks: { mev: 4, mav: 8, mrv: 12 }, recoveryHours: 36 },
  [MuscleGroup.Abductors]: { landmarks: { mev: 4, mav: 8, mrv: 12 }, recoveryHours: 36 },
}

/** Major trainable groups surfaced on the intelligence screen, in display order. */
export const INTEL_GROUPS: readonly MuscleGroup[] = [
  MuscleGroup.Chest,
  MuscleGroup.Back,
  MuscleGroup.Shoulders,
  MuscleGroup.Biceps,
  MuscleGroup.Triceps,
  MuscleGroup.Forearms,
  MuscleGroup.Core,
  MuscleGroup.Quadriceps,
  MuscleGroup.Hamstrings,
  MuscleGroup.Glutes,
  MuscleGroup.Calves,
]

export const MuscleIntelConfig = {
  /** Rolling window (days) over which weekly effective sets are summed. */
  windowDays: 7,
  /** Effective sets in one session treated as a "normal" recovery load (factor 1). */
  referenceSessionLoad: 6,
  /** Clamp for how much a heavy/light last session stretches recovery time. */
  loadFactor: { min: 0.6, max: 1.5 },
  /** Recovery-% thresholds for the readiness bands. */
  readiness: { readyPct: 90, recoveringPct: 50 },
} as const
