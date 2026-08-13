import type { Stage } from '../config'
import type { Pose } from '@/types/scene'

/** smootherstep, flat acceleration at both ends so nothing jolts on departure */
export function ease(u: number): number {
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** blends any two stages, so an interrupted flight can become the next from */
export function stageAt(from: Stage, to: Stage, u: number): Stage {
  const e = ease(u)
  const mix = (a: number, b: number) => a + (b - a) * e

  return {
    w: mix(from.w, to.w),
    y: mix(from.y, to.y),
    room: mix(from.room, to.room),
    push: mix(from.push, to.push),
  }
}

/** a stage only becomes a screen space pose once the viewport is known */
export function poseOf(stage: Stage, vw: number, vh: number): Pose {
  return {
    w: stage.w * vw,
    cx: vw / 2,
    cy: stage.y * vh,
  }
}
