import { Button } from '@/components/ui/Button'

const DESTINATIONS = [
  { label: 'docs', href: '#' },
  { label: 'github', href: '#' },
]

interface NavbarProps {
  /** which set of actions the corner holds, the fade itself rides the flight */
  atAuth: boolean
}

export function Navbar({ atAuth }: NavbarProps) {
  return (
    <nav aria-label="Main" className="sticky top-0 z-20">
      <div className="mx-auto flex h-22 max-w-page items-center justify-between gap-8 px-pad">
        <ul className="flex items-center gap-8 sm:gap-12">
          {DESTINATIONS.map(({ label, href }) => (
            <li key={label}>
              <Button variant="quiet" href={href}>
                {label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          <Button variant="quiet" to="/login">
            sign in
          </Button>

          <Button to="/register">
            register
            <span aria-hidden="true"></span>
          </Button>

          {/* always in the flow so nothing shifts, it only fades with the flight */}
          <Button
            variant="quiet"
            to="/"
            aria-hidden={!atAuth}
            className={`exit-in ${atAuth ? '' : 'pointer-events-none'}`}
          >
            return back
          </Button>
        </div>
      </div>
    </nav>
  )
}
