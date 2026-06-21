import { Language } from '../../domain/enums/Language'
import { StorageKey } from '../../domain/enums/StorageKey'
import type { Translation } from './types'
import { en } from './en'
import { fr } from './fr'
import { ar } from './ar'

export type { Translation, UiStrings } from './types'

/** All language packs, keyed by language. */
export const TRANSLATIONS: Readonly<Record<Language, Translation>> = {
  [Language.English]: en,
  [Language.French]: fr,
  [Language.Arabic]: ar,
}

/** Native names for the language switcher (endonyms — the same in every UI). */
export const LANGUAGE_LABELS: Readonly<Record<Language, string>> = {
  [Language.English]: 'English',
  [Language.French]: 'Français',
  [Language.Arabic]: 'العربية',
}

/** Languages written right-to-left. */
const RTL_LANGUAGES: ReadonlySet<Language> = new Set([Language.Arabic])

export const DEFAULT_LANGUAGE = Language.English

/** Writing direction for a language (for <html dir> and any directional CSS). */
export function dirFor(language: Language): 'rtl' | 'ltr' {
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
}

function isLanguage(value: string | null): value is Language {
  return value != null && (Object.values(Language) as string[]).includes(value)
}

/**
 * The active language for this session, read once from localStorage (falling
 * back to the browser language, then English). The label maps in config/labels
 * are resolved from this at import time, so switching language reloads the app
 * (see {@link setActiveLanguage}) — simpler and fully consistent vs. threading a
 * context through every label lookup.
 */
export function getActiveLanguage(): Language {
  try {
    const stored = localStorage.getItem(StorageKey.Language)
    if (isLanguage(stored)) return stored
    const browser = navigator.language?.slice(0, 2)
    if (isLanguage(browser ?? null)) return browser as Language
  } catch {
    // localStorage / navigator unavailable (SSR, privacy mode) — use the default.
  }
  return DEFAULT_LANGUAGE
}

/** Persists the chosen language and reloads so all copy re-resolves to it. */
export function setActiveLanguage(language: Language): void {
  try {
    localStorage.setItem(StorageKey.Language, language)
  } catch {
    // Can't persist (privacy mode / storage full) — a reload wouldn't stick, so
    // leave the UI as-is rather than flashing back to the previous language.
    return
  }
  window.location.reload()
}

/** Sets <html lang> and <html dir> — call once at startup. */
export function applyDocumentLanguage(language: Language): void {
  const root = document.documentElement
  root.lang = language
  root.dir = dirFor(language)
}
