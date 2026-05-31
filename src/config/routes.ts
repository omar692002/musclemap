/**
 * Application route patterns and path builders.
 * Centralised so no route string is hardcoded across the UI.
 */
export const AppRoutes = {
  browser: '/',
  exerciseDetail: '/exercise/:id',
  muscleMap: '/map',
  program: '/program',
} as const

/**
 * Query-string keys for the browser's filters. Kept in the URL so filters
 * survive back-navigation and the view is shareable/bookmarkable.
 */
export const BrowserParam = {
  search: 'q',
  group: 'group',
  equipment: 'equipment',
  muscle: 'muscle',
  head: 'head',
} as const

/** Browser URL pre-filtered to a single muscle (used by the muscle map). */
export function browserPathForMuscle(muscleId: string): string {
  const params = new URLSearchParams()
  params.set(BrowserParam.muscle, muscleId)
  return `${AppRoutes.browser}?${params.toString()}`
}

/** Browser URL pre-filtered to a single muscle head (used by the 3D map). */
export function browserPathForHead(headId: string): string {
  const params = new URLSearchParams()
  params.set(BrowserParam.head, headId)
  return `${AppRoutes.browser}?${params.toString()}`
}

/** Builds the detail URL for an exercise id (ids are URL-encoded). */
export function exerciseDetailPath(id: string): string {
  return `/exercise/${encodeURIComponent(id)}`
}
