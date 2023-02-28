import { gsap } from "gsap"
import { Viewport } from "pixi-viewport"
import { Point } from "pixi.js"

import { session } from "utils/localUtils"

import { triggerMovementManually } from "./PixiViewport"

let runningTween: gsap.core.Tween | undefined

const defaultPadding = {
  top: 100,
  bottom: 100,
  left: 100,
  right: 100,
}

export const canMoveCamera = () => {
  if (session.lastMapInteraction) {
    const now = new Date()
    const diff = now.getTime() - session.lastMapInteraction.getTime()
    if (diff < 10000) {
      return false
    }
  }
  return true
}

export const zoomToPlayer = (x: number, z: number, viewport: Viewport) => {
  if (session.pointOfInterest) {
    zoomToTwoPoints(
      new Point(x, z),
      new Point(session.pointOfInterest.x, session.pointOfInterest.z),
      viewport
    )
  } else {
    centerPoint(new Point(x, z), viewport)
  }
}

/**
 * pixi-viewport version with gsap
 */
const zoomToTwoPoints = (a: Point, b: Point, viewport: Viewport) => {
  runningTween?.kill()
  const cameraPadding = session.cameraPadding ?? defaultPadding

  const getPadding = (padding: keyof typeof cameraPadding) => {
    return cameraPadding[padding] / viewport.scale.x
  }

  // center the two points
  const centerX =
    (a.x + b.x) / 2 - (getPadding("left") - getPadding("right")) / 2
  const centerZ =
    (a.y + b.y) / 2 - (getPadding("top") - getPadding("bottom")) / 2

  // zoom to fit the two points with padding
  const distanceX = Math.abs(a.x - b.x)
  const distanceY = Math.abs(a.y - b.y)
  const zoomX =
    viewport.screenWidth /
    (distanceX + getPadding("left") + getPadding("right"))
  const zoomY =
    viewport.screenHeight /
    (distanceY + getPadding("top") + getPadding("bottom"))
  const zoom = Math.min(zoomX, zoomY)

  const values = {
    x: viewport.center.x,
    y: viewport.center.y,
    zoom: viewport.scale.x,
  }

  if (canMoveCamera())
    runningTween = gsap.to(values, {
      x: centerX,
      y: centerZ,
      zoom,
      duration: 1,
      ease: "linear",
      onUpdate: () => {
        if (!canMoveCamera()) return
        viewport.moveCenter(values.x, values.y)
        viewport.setZoom(values.zoom)
        triggerMovementManually()
      },
    })
}

const centerPoint = (point: Point, viewport: Viewport) => {
  runningTween?.kill()
  const cameraPadding = session.cameraPadding ?? defaultPadding

  const getPadding = (padding: keyof typeof cameraPadding) => {
    return cameraPadding[padding] / viewport.scale.x
  }

  // center the two points
  const centerX = point.x - (getPadding("left") - getPadding("right")) / 2
  const centerZ = point.y - (getPadding("top") - getPadding("bottom")) / 2

  const values = {
    x: viewport.center.x,
    y: viewport.center.y,
  }

  if (canMoveCamera())
    runningTween = gsap.to(values, {
      x: centerX,
      y: centerZ,
      duration: 1,
      ease: "linear",
      onUpdate: () => {
        if (!canMoveCamera()) return
        viewport.moveCenter(values.x, values.y)
        triggerMovementManually()
      },
    })
}
