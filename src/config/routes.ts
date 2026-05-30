/**
 * Application route patterns and path builders.
 * Centralised so no route string is hardcoded across the UI.
 */
export const AppRoutes = {
  browser: '/',
  exerciseDetail: '/exercise/:id',
} as const

/** Builds the detail URL for an exercise id (ids are URL-encoded). */
export function exerciseDetailPath(id: string): string {
  return `/exercise/${encodeURIComponent(id)}`
}
