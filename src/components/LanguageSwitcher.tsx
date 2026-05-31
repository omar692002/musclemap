import { Language } from '../domain/enums/Language'
import { getActiveLanguage, setActiveLanguage, LANGUAGE_LABELS } from '../config/i18n'
import { UiText } from '../config/labels'

/**
 * Floating language picker (EN / FR / AR). Changing it persists the choice and
 * reloads so all copy — and the page direction for Arabic — re-resolve.
 */
export function LanguageSwitcher() {
  const current = getActiveLanguage()
  return (
    <label className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs shadow-sm backdrop-blur">
      <span className="sr-only">{UiText.languageLabel}</span>
      <span aria-hidden className="text-slate-400">
        🌐
      </span>
      <select
        value={current}
        onChange={(event) => setActiveLanguage(event.target.value as Language)}
        aria-label={UiText.languageLabel}
        className="bg-transparent text-slate-200 focus:outline-none"
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
