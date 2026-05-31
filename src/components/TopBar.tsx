import { Link } from 'react-router-dom'
import { AppRoutes } from '../config/routes'
import { UiText } from '../config/labels'
import { LanguageSwitcher } from './LanguageSwitcher'

/** Slim app bar: brand (→ home) on one side, language picker on the other. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-700/60 bg-amber-50/85 px-4 py-2.5 backdrop-blur">
      <Link to={AppRoutes.home} className="text-base font-extrabold tracking-tight text-slate-100">
        {UiText.appName}
      </Link>
      <LanguageSwitcher />
    </header>
  )
}
