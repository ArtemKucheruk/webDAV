export const GEO_URL = '/logo.geo'

/** camera lens — wider gives a more dramatic fan */
export const FOV = 40

/** logo width as a fraction of the viewport */
export const START_CAMERA = 0.7

/** how far the pointer turns the logo */
export const TILT = 0.1

/** derived, not a knob: the decoder normalises width to 1 unit */
export const HALF_W = 0.5

/** floor bounce */
export const ENV_BOT = '#F2F5F9'

export interface GradientAnchor {
  c: string
  /** x runs -0.5..0.5 across the logo width */
  p: [number, number]
  /** falloff radius */
  r: number
}

export const ANCHOR: GradientAnchor[] = [
  { c: '#000000', p: [-0.52, 0.30], r: 0.62 }, // top left
  { c: '#000000', p: [-0.10, -0.34], r: 0.58 }, // low centre-left
  { c: '#000000', p: [0.34, 0.36], r: 0.60 }, // top right
  { c: '#000000', p: [0.56, -0.30], r: 0.40 }, // low right
]

/** light directions, as GLSL expressions */
export const KEY_DIR = 'normalize(vec3(-0.42, 0.55, 0.72))'
export const FILL_DIR = 'normalize(vec3(0.72, -0.34, 0.55))'
