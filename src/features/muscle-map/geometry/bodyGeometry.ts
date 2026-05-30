import { MuscleId } from '../../../domain/enums/MuscleId'
import { BodyView } from '../../../domain/enums/BodyView'
import { MuscleMapConfig } from '../../../config/muscleMap.config'
import type { BodyShape } from './shapes'
import { mirrorShape } from './shapes'

/** A clickable muscle area: one taxonomy muscle, on one view, drawn as shapes. */
export interface MuscleRegion {
  readonly muscleId: MuscleId
  readonly view: BodyView
  readonly shapes: readonly BodyShape[]
}

const AXIS = MuscleMapConfig.axis

/** A shape plus its mirror — for the many muscles that come as a left/right pair. */
function pair(shape: BodyShape): BodyShape[] {
  return [shape, mirrorShape(shape, AXIS)]
}

function region(muscleId: MuscleId, view: BodyView, shapes: readonly BodyShape[]): MuscleRegion {
  return { muscleId, view, shapes }
}

/**
 * Neutral body outline drawn behind the muscle regions (head, joints, hands,
 * feet) so the figure reads as a body. Shared by both views. Stylised, not
 * anatomical — deliberately "clean and simple" per the brief.
 */
export const BODY_SILHOUETTE: readonly BodyShape[] = [
  { kind: 'ellipse', cx: 110, cy: 30, rx: 20, ry: 24 }, // head
  { kind: 'rect', x: 101, y: 50, w: 18, h: 14, r: 5 }, // neck
  { kind: 'rect', x: 74, y: 60, w: 72, h: 118, r: 22 }, // torso
  { kind: 'rect', x: 80, y: 170, w: 60, h: 36, r: 14 }, // pelvis
  ...pair({ kind: 'rect', x: 48, y: 66, w: 22, h: 78, r: 11 }), // upper arms
  ...pair({ kind: 'rect', x: 44, y: 142, w: 20, h: 72, r: 10 }), // forearms
  ...pair({ kind: 'ellipse', cx: 54, cy: 222, rx: 9, ry: 11 }), // hands
  ...pair({ kind: 'rect', x: 82, y: 198, w: 26, h: 110, r: 13 }), // thighs
  ...pair({ kind: 'rect', x: 86, y: 304, w: 20, h: 98, r: 10 }), // lower legs
  ...pair({ kind: 'ellipse', cx: 96, cy: 410, rx: 11, ry: 8 }), // feet
]

const FRONT: readonly MuscleRegion[] = [
  region(MuscleId.Deltoid, BodyView.Front, pair({ kind: 'ellipse', cx: 72, cy: 78, rx: 14, ry: 13 })),
  region(MuscleId.PectoralisMajor, BodyView.Front, pair({ kind: 'ellipse', cx: 92, cy: 98, rx: 17, ry: 13 })),
  region(MuscleId.BicepsBrachii, BodyView.Front, pair({ kind: 'ellipse', cx: 60, cy: 106, rx: 10, ry: 24 })),
  region(MuscleId.Forearms, BodyView.Front, pair({ kind: 'ellipse', cx: 54, cy: 172, rx: 9, ry: 30 })),
  region(MuscleId.HipAbductors, BodyView.Front, pair({ kind: 'ellipse', cx: 84, cy: 192, rx: 10, ry: 15 })),
  region(MuscleId.Quadriceps, BodyView.Front, pair({ kind: 'ellipse', cx: 94, cy: 252, rx: 15, ry: 44 })),
  region(MuscleId.Neck, BodyView.Front, [{ kind: 'rect', x: 101, y: 50, w: 18, h: 14, r: 5 }]),
  region(MuscleId.RectusAbdominis, BodyView.Front, [{ kind: 'rect', x: 95, y: 118, w: 30, h: 58, r: 8 }]),
  region(MuscleId.HipAdductors, BodyView.Front, pair({ kind: 'ellipse', cx: 101, cy: 236, rx: 8, ry: 22 })),
]

const BACK: readonly MuscleRegion[] = [
  region(MuscleId.Deltoid, BodyView.Back, pair({ kind: 'ellipse', cx: 72, cy: 78, rx: 14, ry: 13 })),
  region(MuscleId.Trapezius, BodyView.Back, [
    { kind: 'poly', points: [[110, 50], [140, 76], [122, 104], [98, 104], [80, 76]] },
  ]),
  region(MuscleId.LatissimusDorsi, BodyView.Back, pair({ kind: 'ellipse', cx: 90, cy: 140, rx: 16, ry: 26 })),
  region(MuscleId.TricepsBrachii, BodyView.Back, pair({ kind: 'ellipse', cx: 60, cy: 106, rx: 10, ry: 24 })),
  region(MuscleId.Forearms, BodyView.Back, pair({ kind: 'ellipse', cx: 54, cy: 172, rx: 9, ry: 30 })),
  region(MuscleId.Gluteus, BodyView.Back, pair({ kind: 'ellipse', cx: 95, cy: 204, rx: 17, ry: 17 })),
  region(MuscleId.Hamstrings, BodyView.Back, pair({ kind: 'ellipse', cx: 94, cy: 268, rx: 14, ry: 40 })),
  region(MuscleId.Calves, BodyView.Back, pair({ kind: 'ellipse', cx: 95, cy: 344, rx: 12, ry: 34 })),
  region(MuscleId.Rhomboids, BodyView.Back, [{ kind: 'rect', x: 99, y: 104, w: 22, h: 20, r: 4 }]),
  region(MuscleId.ErectorSpinae, BodyView.Back, [{ kind: 'rect', x: 101, y: 150, w: 18, h: 44, r: 6 }]),
]

export const MUSCLE_REGIONS: readonly MuscleRegion[] = [...FRONT, ...BACK]

/** The regions drawn on a given view, in paint order (earlier = underneath). */
export function regionsForView(view: BodyView): readonly MuscleRegion[] {
  return MUSCLE_REGIONS.filter((reg) => reg.view === view)
}
