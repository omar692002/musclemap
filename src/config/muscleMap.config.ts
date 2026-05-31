import { MuscleRole } from '../domain/enums/MuscleRole'

/**
 * Geometry + palette for the interactive muscle map. Centralised so the SVG
 * components carry no hardcoded numbers/colours and a later theme pass (the
 * planned light "solar" look) only edits this file.
 */
export const MuscleMapConfig = {
  /** Coordinate space every body figure is authored in (single figure). */
  viewBox: '0 0 220 470',
  /** Vertical centre line used to mirror left/right muscle regions. */
  axis: 110,
  strokeWidth: 1,
  selectedStrokeWidth: 2.5,
  colors: {
    silhouette: '#e7d6bd',
    region: '#f2e6d2',
    regionStroke: '#c9ad84',
    selectedStroke: '#ea580c',
  },
  /** Palette for the 3D model view (three.js materials). */
  model3d: {
    body: '#e7d6bd',
    muscle: '#c75d54',
    muscleHover: '#e8857a',
    selected: '#f59e0b',
    background: '#fff7ed',
    /** Unmapped body parts (head/feet/hands, deep muscles) — neutral warm grey so
     *  the figure looks complete and dimmed muscles recede on the light theme. */
    inactive: '#c8bba6',
    /** Pure connective tissue (fascia/tendon/…) — a faint see-through shell so
     *  it never hides the muscles. */
    fascia: '#d9c2a0',
    fasciaOpacity: 0.05,
  },
} as const

/** Fill colour applied to a muscle region by the role it plays (heat scale). */
export const ROLE_FILL: Readonly<Record<MuscleRole, string>> = {
  [MuscleRole.Primary]: '#ef4444',
  [MuscleRole.Secondary]: '#f59e0b',
  [MuscleRole.Stabilizer]: '#a3a3a3',
}
