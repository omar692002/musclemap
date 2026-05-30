/**
 * Configuration for the bundled (static) data source.
 * Centralised so no data-source URL/string is hardcoded at a call site.
 *
 * Exercise images are not bundled; they are served from the upstream
 * `yuhonas/free-exercise-db` repository via the jsDelivr CDN. The
 * normaliser resolves each relative image path against this base.
 */
export const DataSourceConfig = {
  exerciseImageBaseUrl:
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/',
} as const

export type DataSourceConfig = typeof DataSourceConfig
