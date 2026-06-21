/**
 * Keys for client-side persistence (localStorage / IndexedDB).
 * Centralised so persistence keys are never hardcoded at call sites.
 */
export enum StorageKey {
  SavedPrograms = 'musclemap.savedPrograms',
  UserPreferences = 'musclemap.userPreferences',
  Language = 'musclemap.language',
  AuthUser = 'musclemap.authUser',
  AuthToken = 'musclemap.authToken',
  UserProfile = 'musclemap.userProfile',
  WorkoutLogs = 'musclemap.workoutLogs',
  BodyweightLogs = 'musclemap.bodyweightLogs',
  Subscription = 'musclemap.subscription',
  Theme = 'musclemap.theme',
}
