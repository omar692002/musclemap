/**
 * Single source of truth for app-wide identity/branding constants.
 * Centralised here so nothing is hardcoded across the UI or the PWA manifest.
 */
export const AppConfig = {
  name: 'MuscleMap',
  shortName: 'MuscleMap',
  description:
    'Visual muscle anatomy and a balanced, non-redundant workout program generator.',
  themeColor: '#0f172a',
  backgroundColor: '#0f172a',
  startUrl: '/',
} as const;

export type AppConfig = typeof AppConfig;
