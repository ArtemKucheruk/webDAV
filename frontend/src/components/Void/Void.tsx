import { useEffect, useRef } from 'react'
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
import {
  ANCHOR,
  DUR,
  ENV_BOT,
  FOV,
  HALF_W,
  SKY_FRAG,
  SKY_VERT,
  TILT_PITCH,
  TILT_YAW,
  createLogoMaterial,
  loadLogo,
  poseAt,
} from '@/scene'
import type { SceneUniforms } from '@/types/scene'

export function Void() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
    } catch {
      return
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

    function place(px: number, cxPx: number, cyPx: number) {
      const tan = Math.tan((FOV * Math.PI) / 360)
      const aspect = vw / vh
      const d = vw / px / (2 * tan * aspect)
      camera.position.z = d
      camera.position.x = -((cxPx / vw) * 2 - 1) * d * tan * aspect
      camera.position.y = ((cyPx / vh) * 2 - 1) * d * tan
      camera.near = Math.max(0.01, d * 0.04)
      camera.far = d + depth * 1.4 + 1
      camera.updateProjectionMatrix()
      uniforms.uCam.value.copy(camera.position)
      uniforms.uLogo.value.set(cxPx * dpr, (vh - cyPx) * dpr, px * dpr, uniforms.uLogo.value.w)
    }

    function resize() {
      vw = window.innerWidth
      vh = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(vw, vh, false) 
      camera.aspect = vw / vh
      uniforms.uRes.value.set(vw * dpr, vh * dpr)
      applyPose()
      dirty = true
    }

    function applyPose() {
      const p = poseAt(u, vw, vh)
      place(p.w, p.cx, p.cy)
    }

    function launch() {
      if (launched) return
      launched = true
      t0 = performance.now()
      poke()
    }

    function queue() {
      if (raf === null && !document.hidden) raf = requestAnimationFrame(frame)
    }

    function poke() {
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

    function onResize() {
      resize()
      poke()
    }

    function onVisibility() {
      if (!document.hidden) poke()
    }

    function onPointerMove(e: PointerEvent) {
      tx = (e.clientX / window.innerWidth - 0.5) * -2
      ty = (e.clientY / window.innerHeight - 0.5) * -2
      poke()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key.startsWith('Arrow') || e.key === ' ' || e.key === 'PageDown') launch()
    }

    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    window.addEventListener('wheel', launch, { passive: true })
    window.addEventListener('touchmove', launch, { passive: true })
    window.addEventListener('pointerdown', launch, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      /* no flight: land it and let the page be a page */
      u = 1
      launched = true
    }

    if (window.matchMedia('(pointer: fine)').matches && !reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }

    const controller = new AbortController()
    let logo: Mesh | null = null
    let logoMaterial: ShaderMaterial | null = null

    loadLogo(undefined, controller.signal)
      .then(({ geometry, halfH, depth: d }) => {
        depth = d
        uniforms.uHalfH.value = halfH
        uniforms.uDepth.value = d
        uniforms.uLogo.value.w = 1
        logoMaterial = createLogoMaterial(uniforms)
        logo = new Mesh(geometry, logoMaterial)
        pivot.add(logo)
        resize()
        poke()
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) console.error(err)
      })

    resize()
    poke()

    return () => {
      controller.abort()
      if (raf !== null) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('wheel', launch)
      window.removeEventListener('touchmove', launch)
      window.removeEventListener('pointerdown', launch)
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibility)
      logo?.geometry.dispose()
      logoMaterial?.dispose()
      skyGeometry.dispose()
      skyMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 block h-full w-full" />
}
