import { useLocation } from 'react-router-dom'
import { Footer } from '@/components/Footer/Footer'
import { Reach } from '@/components/Reach/Reach'
import { Reach_2 } from '@/components/Reach_2/Reach_2'
import { StoryFolder } from '@/components/StoryFolder'
import { SAY_Y } from '@/scene'

export function Hero() {
  const atHome = useLocation().pathname === '/'

  return (
    <>
      <p
        style={{ top: `${SAY_Y * 100}svh` }}
        className="exit-fade pointer-events-none absolute inset-x-0 z-10 mx-auto max-w-[60ch] px-pad text-center text-[clamp(13.5px,1.6vw,16px)] text-balance text-ink-2"
      >
        A slice of your own server, reachable from your phone
      </p>

      <section className="exit-fade pointer-events-none absolute inset-x-0 top-[52svh] z-10 px-pad">
        <Reach />
      </section>

      {atHome && (
        <>
          <section className="h-svh" />

          <StoryFolder />

          <Reach_2 />

          <Footer />
        </>
      )}
    </>
  )
}
