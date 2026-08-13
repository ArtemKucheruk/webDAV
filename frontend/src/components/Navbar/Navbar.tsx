import { Button } from '@/components/ui/Button'

const DESTINATIONS = [
  { label: 'docs', href: '#' },
  { label: 'github', href: '#' },
]

export function Navbar() {
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
        </div>
      </div>
    </nav>
  )
}
