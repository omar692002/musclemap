/**
 * Tiny primitive shapes the body figures are drawn from. Using a few typed
 * primitives (instead of raw SVG path strings) keeps the geometry readable and
 * makes left/right symmetry a one-line mirror rather than hand-authored twins.
 */
export type BodyShape =
  | { readonly kind: 'ellipse'; readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number }
  | { readonly kind: 'rect'; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly r?: number }
  | { readonly kind: 'poly'; readonly points: readonly (readonly [number, number])[] }

/** Reflects a shape across the vertical line x = `axis` (for the other side). */
export function mirrorShape(shape: BodyShape, axis: number): BodyShape {
  switch (shape.kind) {
    case 'ellipse':
      return { ...shape, cx: 2 * axis - shape.cx }
    case 'rect':
      return { ...shape, x: 2 * axis - (shape.x + shape.w) }
    case 'poly':
      return { ...shape, points: shape.points.map(([x, y]) => [2 * axis - x, y] as const) }
  }
}
