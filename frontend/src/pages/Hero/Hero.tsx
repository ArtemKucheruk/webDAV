import { SAY_Y } from '@/scene'

/** hero copy sits with the scene, its height is a scene constant and it has to
    outlive the route to thin out with the flight */
export function Hero() {
  return (
    <p
      style={{ top: `${SAY_Y * 100}svh` }}
      className="exit-fade pointer-events-none absolute inset-x-0 z-10 mx-auto max-w-[60ch] px-pad text-center text-[clamp(13.5px,1.6vw,16px)] text-balance text-ink-2"
    >
      A slice of your own server, reachable from your phone
    </p>
  )
}
