import { DOCK_W, DOCK_Y, START_CAMERA } from './config'
import type { Pose } from '@/types/scene'

/** symmetric cubic — starts and stops, never flung */
export function ease(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
}

/** pose at progress u, where 0 is the opening and 1 is docked */
export function poseAt(u: number, vw: number, vh: number): Pose {
  const e = ease(u)
  return {
    w: (START_CAMERA + (DOCK_W - START_CAMERA) * e) * vw,
    cx: vw / 2,
    cy: (0.5 + (DOCK_Y - 0.5) * e) * vh,
  }
}
