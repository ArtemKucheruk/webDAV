import { BufferAttribute, BufferGeometry, DoubleSide, ShaderMaterial } from 'three'
import { FILL_DIR, GEO_URL, KEY_DIR } from './constants'
import { ENV } from './env'
import type { LogoGeometry, SceneUniforms } from '@/types/scene'

/** "CGEO" | vcount u32 | icount u32 | centre 3f | half f */
const HEADER_BYTES = 28
const MAGIC = 0x4347454f

/** quantised int16: header, then positions, then indices */
export function decodeLogo(buffer: ArrayBuffer): LogoGeometry {
  if (buffer.byteLength < HEADER_BYTES) {
    throw new Error(`logo: truncated header (${buffer.byteLength} bytes)`)
  }

  const dv = new DataView(buffer)
  if (dv.getUint32(0, false) !== MAGIC) {
    throw new Error('logo: bad magic, expected CGEO')
  }

  const vcount = dv.getUint32(4, true)
  const icount = dv.getUint32(8, true)

  const expected = HEADER_BYTES + vcount * 6 + icount * 2
  if (buffer.byteLength !== expected) {
    throw new Error(`logo: expected ${expected} bytes, got ${buffer.byteLength}`)
  }

  const q = new Int16Array(buffer, HEADER_BYTES, vcount * 3)
  const idx = new Uint16Array(buffer, HEADER_BYTES + vcount * 6, icount)

  const raw = new Float32Array(vcount * 3)
  for (let i = 0; i < raw.length; i++) raw[i] = q[i] / 32767

  const lo = [Infinity, Infinity, Infinity]
  const hi = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < vcount; i++) {
    for (let k = 0; k < 3; k++) {
      const v = raw[i * 3 + k]
      if (v < lo[k]) lo[k] = v
      if (v > hi[k]) hi[k] = v
    }
  }

  /* derived, not assumed — a re-export can permute the axes */
  const span = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]]
  const [axE, axW, axH] = [0, 1, 2].sort((a, b) => span[b] - span[a])

  const unit = span[axW]
  const halfH = span[axH] / 2 / unit
  const depth = span[axE] / unit
  const capsAspect = 1 / (halfH * 2)

  const cW = (lo[axW] + hi[axW]) / 2
  const cH = (lo[axH] + hi[axH]) / 2

  /* lowercase word: more vertex mass sits below the midline than above */
  let above = 0
  let below = 0
  for (let i = 0; i < vcount; i++) {
    if (raw[i * 3 + axH] > cH) above++
    else below++
  }
  const hSign = below >= above ? 1 : -1

  const pos = new Float32Array(vcount * 3)
  for (let i = 0; i < vcount; i++) {
    pos[i * 3] = (raw[i * 3 + axW] - cW) / unit
    pos[i * 3 + 1] = ((raw[i * 3 + axH] - cH) / unit) * hSign
    pos[i * 3 + 2] = (raw[i * 3 + axE] - hi[axE]) / unit // caps at 0, fan to -depth
  }

  let geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(pos, 3))
  geometry.setIndex(new BufferAttribute(idx, 1))

  /* un-indexing gives flat facet normals — the hard crease is the lighting */
  geometry = geometry.toNonIndexed()
  geometry.computeVertexNormals()

  return { geometry, halfH, depth, capsAspect }
}

export async function loadLogo(
  url: string = GEO_URL,
  signal?: AbortSignal,
): Promise<LogoGeometry> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`logo: ${res.status} ${res.statusText}`)
  return decodeLogo(await res.arrayBuffer())
}

export function createLogoMaterial(uniforms: SceneUniforms): ShaderMaterial {
  return new ShaderMaterial({
    uniforms,
    side: DoubleSide,
    vertexShader: `
uniform float uHalfW, uHalfH, uDepth;
varying vec3 vN; varying vec3 vW; varying vec2 vG; varying float vT;

void main(){
  vN = normalize(normalMatrix * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vG = vec2(position.x / (uHalfW * 2.0), position.y / (uHalfH * 2.0));
  vT = clamp(-position.z / uDepth, 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`,
    fragmentShader: `
uniform vec3 uCam; uniform vec3 uC[4]; uniform vec2 uP[4]; uniform float uR[4];
uniform float uFade;
varying vec3 vN; varying vec3 vW; varying vec2 vG; varying float vT;
${ENV}

void main(){
  // mesh gradient from four gaussian fields
  vec3 base = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < 4; i++) {
    float d = distance(vG, uP[i]);
    float w = exp(-(d * d) / (uR[i] * uR[i]));
    base += uC[i] * w; wsum += w;
  }
  base /= max(wsum, 1e-4);

  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vW);
  // face the viewer, so lighting survives a flipped winding
  if (dot(N, V) < 0.0) N = -N;
  float facing = dot(N, V);          // 1 on the caps, ~0 on the walls
  vec3 room = envAt(gl_FragCoord.xy);

  float key  = max(dot(N, ${KEY_DIR}), 0.0);
  float fill = max(dot(N, ${FILL_DIR}), 0.0);

  // caps hold the colour, walls wash into the room
  vec3 pale = mix(base, room, 0.87);
  vec3 col = mix(pale, base * (0.84 + 0.26 * key + 0.10 * fill), pow(facing, 0.5));
  // the tail sits further away, so more room in front of it
  col = mix(col, room, pow(vT, 0.72) * 0.95);
  // grazing edges melt out
  col = mix(col, room, pow(1.0 - facing, 3.0) * 0.42);
  // one tight sheen, caps only
  vec3 H = normalize(${KEY_DIR} + V);
  col += pow(max(dot(N, H), 0.0), 66.0) * facing * (1.0 - vT) * 0.26;

  col = mix(col, room, uFade);
  gl_FragColor = vec4(col, 1.0);
}`,
  })
}
