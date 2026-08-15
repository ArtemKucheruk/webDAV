import { useEffect, useRef } from 'react'

const START = 0.4
const TOTAL = 5
const GROW = 0.006

const DASH = 10
const GAP = 7
const MAX_PIXELS = 120
const SPAWN_MS = 90

interface Pixel {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  ttl: number
  size: number
}

interface Mote {
  x: number
  y: number
  size: number
  base: number
  phase: number
}

interface Layout {
  cx: number
  deviceY: number
  barX: number
  barY: number
  barW: number
  scale: number
}

function rgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function palette() {
  const s = getComputedStyle(document.documentElement)
  const pick = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback
  return {
    ink: pick('--ink', '#F6F7F7'),
    ink2: pick('--ink-2', '#9BA2AA'),
    ink3: pick('--ink-3', '#5E656E'),
  }
}

function layoutFor(w: number, h: number): Layout {
  const barW = Math.min(w * 0.24, 320)
  return {
    cx: w / 2,
    deviceY: h * 0.42,
    barW,
    barX: (w - barW) / 2,
    barY: h * 0.86,
    scale: Math.min(1, w / 900),
  }
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

function drawLaptop(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  ink3: string,
  ink: string,
  glow: number,
) {
  const w = 186 * s
  const h = 118 * s

  c.lineWidth = 1.5
  c.strokeStyle = rgba(ink3, 1)
  roundRect(c, x - w / 2, y - h / 2, w, h, 8 * s)
  c.stroke()

  roundRect(c, x - w / 2 + 9 * s, y - h / 2 + 9 * s, w - 18 * s, h - 18 * s, 3 * s)
  c.fillStyle = rgba(ink, 0.1 + glow * 0.26)
  c.fill()
  c.strokeStyle = rgba(ink3, 0.8)
  c.lineWidth = 1
  c.stroke()

  const baseY = y + h / 2 + 12 * s
  c.beginPath()
  c.moveTo(x - w / 2 - 20 * s, baseY)
  c.lineTo(x + w / 2 + 20 * s, baseY)
  c.strokeStyle = rgba(ink3, 1)
  c.lineWidth = 1.5
  c.stroke()

  c.beginPath()
  c.moveTo(x - w / 2, y + h / 2)
  c.lineTo(x - w / 2 - 20 * s, baseY)
  c.moveTo(x + w / 2, y + h / 2)
  c.lineTo(x + w / 2 + 20 * s, baseY)
  c.strokeStyle = rgba(ink3, 0.85)
  c.stroke()
}

function drawBar(c: CanvasRenderingContext2D, l: Layout, ink: string, ink3: string, used: number) {
  const filled = l.barW * (used / TOTAL)

  c.lineWidth = 2.5
  c.lineCap = 'butt'
  c.setLineDash([DASH, GAP])

  c.beginPath()
  c.moveTo(l.barX, l.barY)
  c.lineTo(l.barX + l.barW, l.barY)
  c.strokeStyle = rgba(ink3, 0.34)
  c.stroke()

  c.beginPath()
  c.moveTo(l.barX, l.barY)
  c.lineTo(l.barX + filled, l.barY)
  c.strokeStyle = rgba(ink, 0.85)
  c.stroke()

  c.setLineDash([])
}

/** leaves through one side of the screen, out sideways, never to return */
function spawn(l: Layout): Pixel {
  const w = 186 * l.scale
  const h = 118 * l.scale
  const dir = Math.random() < 0.5 ? -1 : 1

  /* fans about 25 degrees off level, so the stream reads horizontal */
  const tilt = (Math.random() - 0.5) * 0.9
  const speed = 0.018 + Math.random() * 0.03

  return {
    x: l.cx + dir * Math.random() * w * 0.4,
    y: l.deviceY + (Math.random() - 0.5) * h * 0.6,
    vx: Math.cos(tilt) * speed * dir,
    vy: Math.sin(tilt) * speed,
    age: 0,
    ttl: 2600 + Math.random() * 2600,
    size: 1.2 + Math.random() * 1.7,
  }
}

export function Reach() {
  const ref = useRef<HTMLCanvasElement>(null)
  const readout = useRef<HTMLElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { ink, ink2, ink3 } = palette()

    let w = 0
    let h = 0
    let motes: Mote[] = []
    const pixels: Pixel[] = []
    let glow = 0
    let last = performance.now()
    let since = 0
    let frame = 0
    let used = START

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      motes = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() < 0.85 ? 1 : 1.8,
        base: 0.05 + Math.random() * 0.13,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (now: number) => {
      const dt = Math.min(now - last, 48)
      last = now
      const l = layoutFor(w, h)

      c.clearRect(0, 0, w, h)

      for (const m of motes) {
        c.fillStyle = rgba(ink, m.base * (0.55 + 0.45 * Math.sin(now / 1400 + m.phase)))
        c.fillRect(m.x, m.y, m.size, m.size)
      }

      if (!reduced) {
        since += dt
        while (since > SPAWN_MS && pixels.length < MAX_PIXELS) {
          since -= SPAWN_MS
          pixels.push(spawn(l))
          glow = Math.min(glow + 0.18, 1)

          used += GROW
          if (used >= TOTAL) used = START

          const shown = used.toFixed(2)
          if (readout.current && readout.current.textContent !== shown) {
            readout.current.textContent = shown
          }
        }
      }

      for (let i = pixels.length - 1; i >= 0; i--) {
        const p = pixels[i]
        p.age += dt

        if (p.age >= p.ttl) {
          pixels.splice(i, 1)
          continue
        }

        p.x += p.vx * dt
        p.y += p.vy * dt

        const t = p.age / p.ttl
        const a = Math.min(p.age / 220, 1) * Math.min((1 - t) / 0.4, 1)
        c.fillStyle = rgba(ink, a * 0.95)
        c.fillRect(p.x, p.y, p.size, p.size)
      }

      glow = Math.max(0, glow - dt * 0.0018)

      drawBar(c, l, ink, ink3, used)
      drawLaptop(c, l.cx, l.deviceY, l.scale, ink2, ink, glow)

      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <figure className="relative w-full">
      <canvas ref={ref} aria-hidden="true" className="block h-[min(24rem,38svh)] w-full" />

      <figcaption className="mt-2 text-center text-[15px] tabular-nums text-ink-3">
        <b ref={readout} className="font-normal text-ink-2">
          {START.toFixed(2)}
        </b>{' '}
        / {TOTAL} GB
      </figcaption>
    </figure>
  )
}
