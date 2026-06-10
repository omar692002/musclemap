import { useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { isAuthEnabled } from '../../config/auth.config'
import { UiText } from '../../config/labels'
import { useAuth } from './AuthContext'
import { mountGoogleSignIn } from './googleIdentity'

/**
 * Top-bar auth control: the Google sign-in button when signed out, or the
 * user's avatar (tap → profile card with sign-out) when signed in.
 * Renders nothing when no Google client id is configured.
 */
export function UserMenu() {
  const { user, signIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const buttonHost = useRef<HTMLDivElement>(null)

  // Mount the GIS button whenever we're signed out.
  useEffect(() => {
    if (user || !isAuthEnabled() || !buttonHost.current) return
    void mountGoogleSignIn(buttonHost.current, signIn)
  }, [user, signIn])

  if (!isAuthEnabled()) return null

  if (!user) {
    return <div ref={buttonHost} className="h-8 overflow-hidden" aria-label={UiText.signIn} />
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="block h-8 w-8 overflow-hidden rounded-full border border-zinc-200 shadow-sm transition active:scale-95"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center bg-orange-100 text-xs font-bold text-orange-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {open ? (
        <div className="absolute end-0 top-10 z-50 w-56 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
          <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
          <p className="truncate text-xs text-zinc-400">{user.email}</p>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            {UiText.signOut}
          </button>
        </div>
      ) : null}
    </div>
  )
}
