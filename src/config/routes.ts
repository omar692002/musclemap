/**
 * Application route patterns and path builders.
 * Centralised so no route string is hardcoded across the UI.
 */
export const AppRoutes = {
  browser: '/',
  exerciseDetail: '/exercise/:id',
} as const

/**
 * Query-string keys for the browser's filters. Kept in the URL so filters
 * survive back-navigation and the view is shareable/bookmarkable.
 */
export const BrowserParam = {
  search: 'q',
  group: 'group',
  equipment: 'equipment',
} as const

/** Builds the detail URL for an exercise id (ids are URL-encoded). */
export function exerciseDetailPath(id: string): string {
  return `/exercise/${encodeURIComponent(id)}`
}
