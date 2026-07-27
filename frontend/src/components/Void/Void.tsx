import { useEffect, useRef } from 'react'
import { createScene } from '@/scene'

export function Void() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = createScene(canvas)
    if (!scene) return // no WebGL — the CSS background stands in

    const onResize = () => scene.resize()
    const onLaunch = () => scene.launch()

    const onVisibility = () => {
      if (!document.hidden) scene.wake()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow') || e.key === ' ' || e.key === 'PageDown') scene.launch()
    }

    const onPointerMove = (e: PointerEvent) => {
      scene.setPointer(
        (e.clientX / window.innerWidth - 0.5) * -2,
        (e.clientY / window.innerHeight - 0.5) * -2,
      )
    }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('wheel', onLaunch, { passive: true })
    window.addEventListener('touchmove', onLaunch, { passive: true })
    window.addEventListener('pointerdown', onLaunch, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibility)

    const canDrift =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (canDrift) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onLaunch)
      window.removeEventListener('touchmove', onLaunch)
      window.removeEventListener('pointerdown', onLaunch)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      scene.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 block h-full w-full" />
}
