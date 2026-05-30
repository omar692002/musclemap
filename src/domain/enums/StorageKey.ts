/**
 * Keys for client-side persistence (localStorage / IndexedDB).
 * Centralised so persistence keys are never hardcoded at call sites.
 */
export enum StorageKey {
  SavedPrograms = 'musclemap.savedPrograms',
  UserPreferences = 'musclemap.userPreferences',
}
