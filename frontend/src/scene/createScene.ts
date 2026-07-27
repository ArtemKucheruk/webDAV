import {
  Color,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three'
import { solveCamera } from './motion/camera'
import { ANCHOR, DUR, ENV_BOT, FOV, HALF_W, TILT_PITCH, TILT_YAW } from './config'
import { SKY_FRAG, SKY_VERT } from './shaders/env'
import { poseAt } from './motion/flight'
import { loadLogo } from './geometry/decode'
import { createLogoMaterial } from './shaders/logo'
import type { SceneUniforms } from '@/types/scene'

export interface SceneHandle {
  resize(): void
  /** release the logo — the flight runs once */
  launch(): void
  /** pointer in -1..1, already inverted */
  setPointer(x: number, y: number): void
  /** redraw after something outside changed */
  wake(): void
  dispose(): void
}

/** null when WebGL is unavailable — the caller leaves the CSS background alone */
export function createScene(canvas: HTMLCanvasElement): SceneHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  } catch {
    return null
  }

  const uniforms: SceneUniforms = {
    uRes: { value: new Vector2(1, 1) },
    uEnvBot: { value: new Color(ENV_BOT) },
    uHot: { value: new Vector2(0.5, 1) },
    uLogo: { value: new Vector4(0, 0, 1, 0) },
    uCam: { value: new Vector3() },
    uFade: { value: 0 },
    uHalfW: { value: HALF_W },
    uHalfH: { value: 0.1 },
    uDepth: { value: 1 },
    uC: { value: ANCHOR.map((a) => new Color(a.c)) },
    uP: { value: ANCHOR.map((a) => new Vector2(a.p[0], a.p[1])) },
    uR: { value: ANCHOR.map((a) => a.r) },
  }

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)

  const skyGeometry = new PlaneGeometry(2, 2)
  const skyMaterial = new ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
  })
  const sky = new Mesh(skyGeometry, skyMaterial)
  sky.frustumCulled = false
  sky.renderOrder = -1
  scene.add(sky)

  /* yaw/pitch live on the pivot, so the mesh's own axes stay untouched */
  const pivot = new Object3D()
  scene.add(pivot)

  let vw = 0
  let vh = 0
  let dpr = 1
  let depth = 1
  let dirty = true
  let raf: number | null = null
  let mx = 0
  let my = 0
  let tx = 0
  let ty = 0

  /* flight: u runs 0 (opening) to 1 (docked) */
  let u = 0
  let launched = false
  let t0 = 0

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    u = 1
    launched = true
  }

  function applyPose() {
    const pose = poseAt(u, vw, vh)
    const c = solveCamera(pose, vw, vh, depth)
    camera.position.set(c.x, c.y, c.z)
    camera.near = c.near
    camera.far = c.far
    camera.updateProjectionMatrix()
    uniforms.uCam.value.copy(camera.position)
    uniforms.uLogo.value.set(
      pose.cx * dpr,
      (vh - pose.cy) * dpr,
      pose.w * dpr,
      uniforms.uLogo.value.w,
    )
  }

  function resize() {
    vw = window.innerWidth
    vh = window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(vw, vh, false) // false: CSS owns the element size
    camera.aspect = vw / vh
    uniforms.uRes.value.set(vw * dpr, vh * dpr)
    applyPose()
    wake()
  }

  function queue() {
    if (raf === null && !document.hidden) raf = requestAnimationFrame(frame)
  }

  function wake() {
    dirty = true
    queue()
  }

  function frame() {
    raf = null

    if (launched && u < 1) {
      u = Math.min(1, (performance.now() - t0) / DUR)
      applyPose()
      dirty = true
    }

    mx += (tx - mx) * 0.07
    my += (ty - my) * 0.07
    pivot.rotation.y = mx * TILT_YAW
    pivot.rotation.x = my * TILT_PITCH
    uniforms.uHot.value.set(0.5 * (vw / vh) + mx * 0.09, 1 + my * 0.06)
    if (Math.abs(tx - mx) > 0.0015 || Math.abs(ty - my) > 0.0015) dirty = true

    renderer.render(scene, camera)
    if (dirty) {
      dirty = false
      queue()
    }
  }

  function launch() {
    if (launched) return
    launched = true
    t0 = performance.now()
    wake()
  }

  function setPointer(x: number, y: number) {
    tx = x
    ty = y
    wake()
  }

  const controller = new AbortController()
  let logo: Mesh | null = null
  let logoMaterial: ShaderMaterial | null = null

  loadLogo(undefined, controller.signal)
    .then(({ geometry, halfH, depth: d }) => {
      depth = d
      uniforms.uHalfH.value = halfH
      uniforms.uDepth.value = d
      uniforms.uLogo.value.w = 1 // the contact shadow has something to sit under
      logoMaterial = createLogoMaterial(uniforms)
      logo = new Mesh(geometry, logoMaterial)
      pivot.add(logo)
      resize() // re-place now that the real depth is known
    })
    .catch((err: unknown) => {
      if (!controller.signal.aborted) console.error(err)
    })

  function dispose() {
    controller.abort()
    if (raf !== null) cancelAnimationFrame(raf)
    logo?.geometry.dispose()
    logoMaterial?.dispose()
    skyGeometry.dispose()
    skyMaterial.dispose()
    renderer.dispose()
  }

  resize()

  return { resize, launch, setPointer, wake, dispose }
}
