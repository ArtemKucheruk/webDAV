export const GEO_URL = '/logo.geo'

export interface GradientAnchor {
  c: string
  /** x runs -0.5..0.5 across the width, y bottom to top */
  p: [number, number]
  /** falloff radius — bigger bleeds further */
  r: number
}

/** the four colours blended across the letter faces */
export const ANCHOR: GradientAnchor[] = [
  { c: '#ffffff', p: [-0.52, 0.30], r: 0.62 }, // top left
  { c: '#ffffff', p: [-0.10, -0.34], r: 0.58 }, // low centre-left
  { c: '#ffffff', p: [0.34, 0.36], r: 0.60 }, // top right
  { c: '#ffffff', p: [0.56, -0.30], r: 0.40 }, // low right
]

/** light directions, as GLSL expressions */
export const KEY_DIR = 'normalize(vec3(-0.42, 0.55, 0.72))'
export const FILL_DIR = 'normalize(vec3(0.72, -0.34, 0.55))'

/** derived from the decoder's normalisation — not a knob */
export const HALF_W = 0.5

/* ─── room ──────────────────────────────────────────────────── */

/** the room's upper colour */
export const ENV_TOP = '#12161A'

/** floor colour, reached toward the bottom */
export const ENV_BOT = '#000000'

/* ─── camera ────────────────────────────────────────────────── */

/** lens angle — higher is a wider lens and a more dramatic fan (try 25..60) */
export const FOV = 40

/** pointer tilts the logo up/down (0 freezes it) */
export const TILT_PITCH = 0.06

/** pointer turns the logo left/right (0 freezes it) */
export const TILT_YAW = 0

/* ─── animation ─────────────────────────────────────────────── */

/** opening width, as a fraction of the viewport */
export const START_CAMERA = 0.7

/** flight duration, ms */
export const DUR = 950

/** landed width, as a fraction of the viewport */
export const DOCK_W = 0.34

/** landed centre height — 0.5 is dead centre, lower sits higher up */
export const DOCK_Y = 0.3
