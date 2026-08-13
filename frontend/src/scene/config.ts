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
  { c: '#fafafa', p: [-0.10, -0.34], r: 0.58 }, // low centre-left
  { c: '#ffffff', p: [0.34, 0.36], r: 0.60 }, // top right
  { c: '#f4f4f4', p: [0.56, -0.30], r: 0.40 }, // low right
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
export const FOV = 35

/** pointer tilts the logo up/down (0 freezes it) */
export const TILT_PITCH = 0

/** pointer turns the logo left/right (0 freezes it) */
export const TILT_YAW = 0

/* ─── animation ─────────────────────────────────────────────── */

/** opening width, as a fraction of the viewport */
export const START_CAMERA = 0.65

/** flight duration, ms */
export const DUR = 1000

/** landed width, as a fraction of t he viewport */
export const DOCK_W_DEF = 0.5

/** landed centre height — 0.5 is dead centre, lower sits higher up */
export const DOCK_Y = 0.3

/** auth width, how far the lens dollies in before the push takes over */
export const DOCK_W_AUTH = 6

/** auth centre height, held level with the hero so the exit stays straight */
export const DOCK_Y_AUTH = DOCK_Y

/** how far the logo travels at the camera, must clear the lens plus the extrusion */
export const PUSH_AUTH = 8

/** auth flight duration, ms, longer than the opening so the push reads */
export const AUTH_DUR = 2400

/** supporting line's height, clear of the fan below the caps */
export const SAY_Y = 0.46

/* ─── stages ────────────────────────────────────────────────── */

/** a resting state for the whole scene, in viewport relative terms */
export interface Stage {
  /** logo width as a fraction of the viewport, above 1 the caps overfill it */
  w: number
  /** logo centre height, 0.5 is dead centre */
  y: number
  /** room brightness, 1 is lit and 0 is pure black */
  room: number
  /** units the logo travels toward the camera, past it means out of sight */
  push: number
}

/** every state the scene settles at, flights just interpolate between two */
export const STAGE = {
  opening: { w: START_CAMERA, y: 0.5, room: 1, push: 0 },
  hero: { w: DOCK_W_DEF, y: DOCK_Y, room: 1, push: 0 },
  auth: { w: DOCK_W_AUTH, y: DOCK_Y_AUTH, room: 0, push: PUSH_AUTH },
} satisfies Record<string, Stage>

export type StageName = keyof typeof STAGE
