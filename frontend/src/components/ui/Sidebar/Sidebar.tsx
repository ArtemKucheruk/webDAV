import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/RequireAuth'

const SECTIONS = [
  { label: 'profile', to: '/account', end: true },
  { label: 'dashboard', to: '/account/dashboard', end: false },
]

const LINK = 'relative block py-2 pl-4 pr-3 text-[15px] transition-colors'

export function Sidebar() {
  const { user } = useAuth()

  return (
    <nav
      aria-label="Account"
      className="fixed inset-x-0 top-0 z-20 flex h-16 items-center gap-2 border-b border-hair bg-ground px-pad sm:inset-y-0 sm:right-auto sm:h-auto sm:w-60 sm:flex-col sm:items-stretch sm:gap-0 sm:border-r sm:border-b-0 sm:px-6 sm:py-10"
    >

      <ul className="flex gap-2 sm:mt-14 sm:flex-col sm:gap-1">
        {SECTIONS.map(({ label, to, end }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `${LINK} ${isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute top-1/2 left-0 h-4 w-px -translate-y-1/2 transition-colors ${
                      isActive ? 'bg-ink' : 'bg-transparent'
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="ml-auto flex min-w-0 items-center gap-4 sm:mt-auto sm:ml-0 sm:flex-col sm:items-start sm:gap-4">
        {/* the navbar is hidden on this page, this is the only way home */}
        <Button variant="solid" to="/" className="shrink-0 text-[15px] sm:pl-4">
          back
        </Button>

        <p title={user.email} className="hidden max-w-full truncate pl-4 text-[13px] text-ink-3 sm:block">
          {user.email}
        </p>
      </div>
    </nav>
  )
}
