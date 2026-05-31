import { NavLink } from 'react-router-dom'
import { AppRoutes } from '../config/routes'
import { UiText } from '../config/labels'

interface NavItem {
  readonly to: string
  readonly icon: string
  readonly label: string
  /** Match the path exactly (used for Home so it isn't active everywhere). */
  readonly end?: boolean
}

const ITEMS: readonly NavItem[] = [
  { to: AppRoutes.home, icon: '🏠', label: UiText.navHome, end: true },
  { to: AppRoutes.browser, icon: '🏋️', label: UiText.navExercises },
  { to: AppRoutes.muscleMap, icon: '🧍', label: UiText.navBody },
  { to: AppRoutes.program, icon: '🗓️', label: UiText.navPlan },
]

/** Fixed mobile-style tab bar — the app's primary navigation. */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 border-t border-slate-700/70 bg-amber-50/90 backdrop-blur">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] transition ${
                isActive ? 'font-semibold text-sky-500' : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <span className="text-xl" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
