import { Theme } from '../../domain/enums/Theme'
import { StorageKey } from '../../domain/enums/StorageKey'

/** Concrete appearance after resolving {@link Theme.System} against the OS. */
export type ResolvedTheme = Theme.Light | Theme.Dark

export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)'

function isTheme(value: string | null): value is Theme {
  return value != null && (Object.values(Theme) as string[]).includes(value)
}

/** The stored preference, falling back to {@link Theme.System}. */
export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(StorageKey.Theme)
    if (isTheme(stored)) return stored
  } catch {
    // localStorage unavailable (privacy mode / SSR) — follow the system.
  }
  return Theme.System
}

/** Persist the chosen preference (no-op if storage is unavailable). */
export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(StorageKey.Theme, theme)
  } catch {
    // Can't persist (privacy mode / storage full) — keep the in-memory choice.
  }
}

export function prefersDark(): boolean {
  try {
    return window.matchMedia(SYSTEM_DARK_QUERY).matches
  } catch {
    return false
  }
}

/** Resolve a preference (+ current system state) to a concrete appearance. */
export function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme === Theme.System) return systemDark ? Theme.Dark : Theme.Light
  return theme
}

/** Toggle the `.dark` class on <html> so the token layer (index.css) flips. */
export function applyResolvedTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolved === Theme.Dark)
}

/**
 * Apply the stored theme to <html> BEFORE first paint (called from main.tsx),
 * so a dark-mode user never sees a flash of the light theme on load.
 */
export function applyStoredTheme(): void {
  applyResolvedTheme(resolveTheme(getStoredTheme(), prefersDark()))
}
