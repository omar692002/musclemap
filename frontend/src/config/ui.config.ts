/**
 * UI tuning constants (centralised, never inlined as magic numbers).
 */
export const UiConfig = {
  /** Exercises rendered per page before "Load more" (keeps the DOM light). */
  browserPageSize: 60,
} as const
