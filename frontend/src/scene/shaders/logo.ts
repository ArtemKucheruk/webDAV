import { DoubleSide, ShaderMaterial } from 'three'
import { FILL_DIR, KEY_DIR } from '../config'
import { ENV } from './env'
import type { SceneUniforms } from '@/types/scene'

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
