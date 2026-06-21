/**
 * Colour-theme preference. `System` follows the OS `prefers-color-scheme`;
 * `Light`/`Dark` pin it. Persisted under {@link StorageKey.Theme}.
 */
export enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}
