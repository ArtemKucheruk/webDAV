const LINKS = [
  { label: 'docs', href: '#' },
  { label: 'pricing', href: '#' },
  { label: 'sign in', href: '#' },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 bg-ground/75 backdrop-blur-[14px]">
      <div className="mx-auto flex h-22 max-w-page items-center justify-evenly gap-5 px-pad">
        {LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-[17px] text-ink-3 transition-colors hover:text-ink"
          >
            {label}
          </a>
        ))}

        <a
          href="#"
          className="inline-flex items-center justify-center rounded-md bg-fill px-7 py-3
            text-[17px] text-on-fill transition-transform hover:-translate-y-px"
        >
          Create account
        </a>
      </div>
    </nav>
  )
}
