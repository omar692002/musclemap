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
    silhouette: '#162133',
    region: '#27384f',
    regionStroke: '#3f5573',
    selectedStroke: '#38bdf8',
  },
  /** Palette for the 3D model view (three.js materials). */
  model3d: {
    body: '#1f2d42',
    muscle: '#c75d54',
    muscleHover: '#e8857a',
    selected: '#38bdf8',
    background: '#0b1220',
    /** Unmapped body parts (head/feet/hands, deep muscles) — neutral, so the
     *  figure looks complete rather than "cut off". */
    inactive: '#47566d',
    /** Pure connective tissue (fascia/tendon/…) — a faint see-through shell so
     *  it never hides the muscles. */
    fascia: '#2a3d59',
    fasciaOpacity: 0.05,
  },
} as const

/** Fill colour applied to a muscle region by the role it plays (heat scale). */
export const ROLE_FILL: Readonly<Record<MuscleRole, string>> = {
  [MuscleRole.Primary]: '#ef4444',
  [MuscleRole.Secondary]: '#f59e0b',
  [MuscleRole.Stabilizer]: '#a3a3a3',
}
