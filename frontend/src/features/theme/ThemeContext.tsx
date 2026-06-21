import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Theme } from '../../domain/enums/Theme'
import {
  SYSTEM_DARK_QUERY,
  applyResolvedTheme,
  getStoredTheme,
  prefersDark,
  resolveTheme,
  storeTheme,
  type ResolvedTheme,
} from './themeStorage'

interface ThemeContextValue {
  /** The user's preference (may be `System`). */
  readonly theme: Theme
  /** The concrete appearance currently shown. */
  readonly resolved: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  // Tracked separately so a System user re-renders on an OS light/dark switch.
  const [systemDark, setSystemDark] = useState<boolean>(prefersDark)

  // `resolved` is derived during render (no setState-in-effect cascade).
  const resolved = useMemo(() => resolveTheme(theme, systemDark), [theme, systemDark])

  // Side effects only: reflect the resolved appearance onto <html> + persist.
  useEffect(() => {
    applyResolvedTheme(resolved)
  }, [resolved])

  useEffect(() => {
    storeTheme(theme)
  }, [theme])

  // Track the OS preference at all times (even when pinned), so switching back
  // to `System` never shows a stale appearance. Updates only the `change`
  // callback — `resolved` ignores it unless the preference is `System`.
  useEffect(() => {
    const media = window.matchMedia(SYSTEM_DARK_QUERY)
    const onChange = () => setSystemDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])

  const value = useMemo<ThemeContextValue>(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
