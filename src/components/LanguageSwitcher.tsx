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
    <label className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-200">
      <span aria-hidden className="text-slate-400">
        🌐
      </span>
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
