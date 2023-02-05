import { session } from "utils/localUtils"

let activeCanvas: fabric.Canvas | undefined

export function easeLinear(
  currentTime: number,
  startValue: number,
  changeInValue: number,
  duration: number
) {
  return startValue + (currentTime / duration) * changeInValue
}

const canMoveCamera = () => {
  if (session.lastMapInteraction) {
    const now = new Date()
    const diff = now.getTime() - session.lastMapInteraction.getTime()
    if (diff < 10000) return false
  }
  return true
}

export const zoomToPlayer = (
  x: number,
  z: number,
  canvas: fabric.Canvas,
  previousPlayerRects: Record<string, fabric.Object>
) => {
  if (session.pointOfInterest) {
    zoomToTwoPoints({ x, z }, session.pointOfInterest, canvas)
    return
  }
  const cameraPadding = session.cameraPadding ?? {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  const getPad = (padding: keyof typeof cameraPadding) => {
    return cameraPadding[padding]
  }

  if (!(activeCanvas === canvas)) return
  if (!canMoveCamera()) return
  const duration = 500
  const start = Date.now()
  const startZoom = canvas.getZoom()
  const startX = canvas.viewportTransform?.[4] ?? 0
  const startZ = canvas.viewportTransform?.[5] ?? 0
  const end = start + duration
  const endZoom = 1
  const endZ =
    -z * endZoom +
    canvas.getHeight() / 2 +
    -getPad("bottom") / 2 +
    getPad("top") / 2
  const endX =
    -x * endZoom +
    canvas.getWidth() / 2 +
    -getPad("right") / 2 +
    getPad("left") / 2
  const animate = () => {
    if (!(activeCanvas === canvas)) return
    if (!canMoveCamera()) return
    const now = Date.now()
    const t = now - start
    const newX = easeLinear(t, startX, endX - startX, duration)
    const newZ = easeLinear(t, startZ, endZ - startZ, duration)
    const zoom = easeLinear(t, startZoom, endZoom - startZoom, duration)
    canvas.setZoom(zoom)
    const vpt = canvas.viewportTransform
    if (vpt) {
      vpt[4] = newX
      vpt[5] = newZ
    }
    if (now < end) {
      requestAnimationFrame(animate)
    }

    Object.values(previousPlayerRects).forEach(rect => {
      rect.setCoords()
    })
  }
  animate()
}

/**
 * given two points, zoom the canvas to fit them both
 */
export const zoomToTwoPoints = (
  a: { x: number; z: number },
  b: { x: number; z: number },
  canvas: fabric.Canvas
) => {
  const cameraPadding = session.cameraPadding ?? {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  const getPad = (padding: keyof typeof cameraPadding) => {
    return cameraPadding[padding] / canvas.getZoom()
  }

  if (!(activeCanvas === canvas)) return
  if (!canMoveCamera()) return
  const padding = 100 / canvas.getZoom()
  const width =
    Math.abs(a.x - b.x) + padding * 2 + getPad("left") + getPad("right")
  const height =
    Math.abs(a.z - b.z) + padding * 2 + getPad("top") + getPad("bottom")
  const centerX = (a.x + b.x) / 2 - (getPad("left") - getPad("right")) / 2
  const centerZ = (a.z + b.z) / 2 - (getPad("top") - getPad("bottom")) / 2
  const MAX_ZOOM = 10
  const endZoom = Math.min(
    canvas.getWidth() / width,
    canvas.getHeight() / height,
    MAX_ZOOM
  )
  const endX = -centerX * endZoom + canvas.getWidth() / 2
  const endZ = -centerZ * endZoom + canvas.getHeight() / 2
  const startZoom = canvas.getZoom()
  const initialVpt = canvas.viewportTransform
  if (!initialVpt) return
  const startX = initialVpt[4]
  const startZ = initialVpt[5]
  const duration = 5000
  const start = Date.now()
  const end = start + duration
  const animate = () => {
    if (!canMoveCamera()) return
    if (!(activeCanvas === canvas)) return
    const now = Date.now()
    const t = now - start
    const newX = easeLinear(t, startX, endX - startX, duration)
    const newZ = easeLinear(t, startZ, endZ - startZ, duration)
    const zoom = easeLinear(t, startZoom, endZoom - startZoom, duration)
    canvas.setZoom(zoom)
    const vpt = canvas.viewportTransform
    if (vpt) {
      vpt[4] = newX
      vpt[5] = newZ
    }
    if (now < end) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

export const updateActiveCanvas = (canvas: fabric.Canvas) => {
  activeCanvas = canvas
}
