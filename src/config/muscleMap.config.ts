import { MuscleRole } from '../domain/enums/MuscleRole'

/**
 * Palette for the interactive 3D muscle map. Centralised so the components
 * carry no hardcoded colours and a theme pass only edits this file.
 */
export const MuscleMapConfig = {
  /** Palette for the 3D model view (three.js materials). */
  model3d: {
    body: '#e2ddd6',
    muscle: '#c75d54',
    muscleHover: '#e8857a',
    selected: '#f59e0b',
    background: '#fafafa',
    /** Unmapped body parts (head/feet/hands, deep muscles) — neutral grey so
     *  the figure looks complete and dimmed muscles recede on the light theme. */
    inactive: '#c4beb4',
    /** Pure connective tissue (fascia/tendon/…) — a faint see-through shell so
     *  it never hides the muscles. */
    fascia: '#cfc8bd',
    fasciaOpacity: 0.05,
  },
} as const

/** Fill colour applied to a muscle region by the role it plays (heat scale). */
export const ROLE_FILL: Readonly<Record<MuscleRole, string>> = {
  [MuscleRole.Primary]: '#ef4444',
  [MuscleRole.Secondary]: '#f59e0b',
  [MuscleRole.Stabilizer]: '#a3a3a3',
}
