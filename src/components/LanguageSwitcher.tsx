import { Globe } from 'lucide-react'
import { Language } from '../domain/enums/Language'
import { getActiveLanguage, setActiveLanguage, LANGUAGE_LABELS } from '../config/i18n'
import { UiText } from '../config/labels'

/**
 * Compact language picker (EN / FR / AR) for the top bar. Changing it persists
 * the choice and reloads so all copy — and the page direction for Arabic —
 * re-resolve.
 */
export function LanguageSwitcher() {
  const current = getActiveLanguage()
  return (
    <label className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300">
      <Globe className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
      <span className="sr-only">{UiText.languageLabel}</span>
      <select
        value={current}
        onChange={(event) => setActiveLanguage(event.target.value as Language)}
        aria-label={UiText.languageLabel}
        className="bg-transparent focus:outline-none"
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
