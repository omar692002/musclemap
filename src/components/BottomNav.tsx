import { NavLink } from 'react-router-dom'
import { CalendarDays, Dumbbell, House, PersonStanding } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppRoutes } from '../config/routes'
import { UiText } from '../config/labels'

interface NavItem {
  readonly to: string
  readonly icon: LucideIcon
  readonly label: string
  /** Match the path exactly (used for Home so it isn't active everywhere). */
  readonly end?: boolean
}

const ITEMS: readonly NavItem[] = [
  { to: AppRoutes.home, icon: House, label: UiText.navHome, end: true },
  { to: AppRoutes.browser, icon: Dumbbell, label: UiText.navExercises },
  { to: AppRoutes.muscleMap, icon: PersonStanding, label: UiText.navBody },
  { to: AppRoutes.program, icon: CalendarDays, label: UiText.navPlan },
]

/** Fixed mobile-style tab bar — the app's primary navigation. */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 border-t border-zinc-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                isActive ? 'text-orange-600' : 'text-zinc-400 hover:text-zinc-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-7 w-14 place-items-center rounded-full transition ${
                    isActive ? 'bg-orange-100/80' : 'group-hover:bg-zinc-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
