import { Sun, Moon, Monitor } from 'lucide-react'
import { Theme } from '../../domain/enums/Theme'
import { useTheme } from './ThemeContext'
import { THEME_LABELS, UiText } from '../../config/labels'

/** Light → Dark → System, cycled in that order on each press. */
const THEME_CYCLE: Readonly<Record<Theme, Theme>> = {
  [Theme.Light]: Theme.Dark,
  [Theme.Dark]: Theme.System,
  [Theme.System]: Theme.Light,
}

const THEME_ICON: Readonly<Record<Theme, typeof Sun>> = {
  [Theme.Light]: Sun,
  [Theme.Dark]: Moon,
  [Theme.System]: Monitor,
}

/**
 * Compact appearance switcher for the top bar. One button cycles light → dark →
 * system; the icon shows the current preference and the label is announced for
 * screen readers.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const Icon = THEME_ICON[theme]
  return (
    <button
      type="button"
      onClick={() => setTheme(THEME_CYCLE[theme])}
      aria-label={`${UiText.themeLabel}: ${THEME_LABELS[theme]}`}
      title={THEME_LABELS[theme]}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-subtle text-muted transition hover:border-line-strong hover:text-ink"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  )
}
