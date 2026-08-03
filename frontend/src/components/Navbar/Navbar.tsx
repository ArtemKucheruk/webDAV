const DESTINATIONS = [
  { label: 'docs', href: '#' },
  { label: 'github', href: '#' },
]

const LINK = 'text-[17px] text-ink-3 transition-colors hover:text-ink'

export function Navbar() {
  return (
    <nav aria-label="Main" className="sticky top-0 z-20">
      <div className="mx-auto flex h-22 max-w-page items-center justify-between gap-8 px-pad">
        <ul className="flex items-center gap-8 sm:gap-12">
          {DESTINATIONS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={LINK}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          <a href="#" className={LINK}>
            sign in
          </a>

          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-md bg-fill px-7 py-2 text-[17px]
              whitespace-nowrap text-on-fill transition-transform motion-safe:hover:-translate-y-px"
          >
            register
            <span aria-hidden="true"></span>
          </a>
        </div>
      </div>
    </nav>
  )
}
