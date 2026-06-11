import { Globe } from 'lucide-react'
import { Language } from '../domain/enums/Language'
import { getActiveLanguage, setActiveLanguage, LANGUAGE_LABELS } from '../config/i18n'
import { UiText } from '../config/labels'

/**
 * Compact language picker (EN / FR / AR) for the top bar. The closed state
 * shows just the language code to leave room for the auth buttons; the native
 * dropdown (an invisible overlay) still lists the full language names.
 * Changing it persists the choice and reloads so all copy — and the page
 * direction for Arabic — re-resolve.
 */
export function LanguageSwitcher() {
  const current = getActiveLanguage()
  return (
    <label className="relative flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-zinc-300">
      <Globe className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
      <span aria-hidden className="uppercase">
        {current}
      </span>
      <select
        value={current}
        onChange={(event) => setActiveLanguage(event.target.value as Language)}
        aria-label={UiText.languageLabel}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {Object.values(Language).map((language) => (
          <option key={language} value={language}>
            {LANGUAGE_LABELS[language]}
          </option>
        ))}
      </select>
    </label>
  )
}
