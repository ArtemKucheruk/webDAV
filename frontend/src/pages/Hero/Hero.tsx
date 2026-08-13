import { Navbar } from '@/components/Navbar'
import { SAY_Y } from '@/scene'

interface HeroProps {
  /** true once the logo has landed, app owns it since the canvas outlives the route */
  docked: boolean
}

export function Hero({ docked }: HeroProps) {
  return (
    <div className="relative z-10 flex min-h-svh flex-col">
      {docked && <Navbar />}
      <main className="mx-auto w-full max-w-page flex-1 px-pad">
        {docked && (
          <p
            style={{ top: `${SAY_Y * 100}svh` }}
            className="absolute inset-x-0 mx-auto max-w-[60ch] text-center text-[clamp(13.5px,1.6vw,16px)] text-balance text-ink-2"
          >
            A slice of your own server, reachable from your phone
          </p>
        )}
      </main>
    </div>
  )
}
