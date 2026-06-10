import { Link } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { AppRoutes } from '../config/routes'
import { UiText } from '../config/labels'
import { LanguageSwitcher } from './LanguageSwitcher'

/** Slim app bar: brand (→ home) on one side, language picker on the other. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/85 px-4 py-2.5 backdrop-blur">
      <Link to={AppRoutes.home} className="flex items-center gap-2">
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm"
        >
          <Dumbbell className="h-4 w-4" />
        </span>
        <span className="text-base font-extrabold tracking-tight text-zinc-900">{UiText.appName}</span>
      </Link>
      <LanguageSwitcher />
    </header>
  )
}
