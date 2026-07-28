import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Void } from '@/components/Void'

export function Hero() {
  const [docked, setDocked] = useState(false)

  return (
    <>
      <Void onDock={() => setDocked(true)} />
      <div className="relative z-10">
        {docked && <Navbar />}
        <main className="mx-auto min-h-svh max-w-page px-pad" />
      </div>
    </>
  )
}
