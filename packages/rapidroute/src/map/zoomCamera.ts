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
      .then(() => {
        zoomToPlayer(x, z, viewport)
      })
      .catch(() => {})
  } else {
    // if the player moved a long ways, zoom out first
    const currentCenter = viewport.center
    const distance = Math.sqrt(
      (currentCenter.x - x) ** 2 + (currentCenter.y - z) ** 2
    )
    if (distance > 3000)
      zoomToTwoPoints(new Point(x, z), currentCenter, viewport)
        .then(() => {
          zoomToPlayer(x, z, viewport)
        })
        .catch(() => {})
    else
      zoomToPoint(new Point(x, z), viewport)
        .then(() => {
          zoomToPlayer(x, z, viewport)
        })
        .catch(() => {})
  }
  // zoomToTwoPoints(new Point(x, z), new Point(0, 0), viewport)
}

/**
 * pixi-viewport version with gsap
 */
const zoomToTwoPoints = (a: Point, b: Point, viewport: Viewport) => {
  return new Promise<void>((resolve, reject) => {
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

    // didn't like the built-in animation so doing this instead
    if (canMoveCamera()) {
      runningTween?.kill()
      runningTween = gsap.to(values, {
        x: centerX,
        y: centerZ,
        zoom,
        duration: 1,
        ease: "linear",
        onUpdate: () => {
          if (!canMoveCamera()) return reject()
          if (viewport.destroyed) return reject()
          viewport.moveCenter(values.x, values.y)
          viewport.setZoom(values.zoom, true)
          triggerMovementManually()
        },
        onComplete: () => {
          resolve()
        },
        onInterrupt: () => {
          reject()
        },
      })
    }
  })
}

export const zoomToPoint = (point: Point, viewport: Viewport) => {
  const boxSize = 500
  return zoomToTwoPoints(
    new Point(point.x + boxSize, point.y + boxSize),
    new Point(point.x - boxSize, point.y - boxSize),
    viewport
  )
}
