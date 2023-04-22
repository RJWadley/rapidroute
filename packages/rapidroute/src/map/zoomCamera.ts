import { Point } from "pixi.js"
import { Viewport } from "pixi-viewport"
import { getLocal } from "utils/localUtils"

import { triggerMovementManually } from "./PixiViewport"

export const defaultPadding = {
  top: 100,
  bottom: 100,
  left: 100,
  right: 100,
}

export const canMoveCamera = () => {
  const lastMapInteraction = getLocal("lastMapInteraction")
  if (lastMapInteraction) {
    const now = new Date()
    const diff = now.getTime() - lastMapInteraction.getTime()
    if (diff < 10_000) {
      return false
    }
  }
  return true
}

export const zoomToPlayer = (x: number, z: number, viewport: Viewport) => {
  const pointOfInterest = getLocal("pointOfInterest")
  if (pointOfInterest) {
    zoomToTwoPoints(
      new Point(x, z),
      new Point(pointOfInterest.x, pointOfInterest.z),
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
  return new Promise<void>(resolve => {
    const cameraPadding = getLocal("cameraPadding") ?? defaultPadding

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
    const endZoom = Math.min(zoomX, zoomY)

    const removeOnWheel = () => {
      viewport.plugins.remove("animate")
    }
    window.addEventListener("wheel", removeOnWheel)
    viewport.animate({
      time: 1000,
      position: new Point(centerX, centerZ),
      scale: endZoom,
      removeOnInterrupt: true,
      callbackOnComplete: () => {
        triggerMovementManually()
        resolve()
        window.removeEventListener("wheel", removeOnWheel)
      },
    })
    setTimeout(() => {
      window.removeEventListener("wheel", removeOnWheel)
    }, 1000)
  })
}

export const zoomToPoint = (
  point: Point,
  viewport: Viewport,
  boxSize = 500
) => {
  return zoomToTwoPoints(
    new Point(point.x + boxSize, point.y + boxSize),
    new Point(point.x - boxSize, point.y - boxSize),
    viewport
  ).then(() => {
    if (canMoveCamera()) zoomToPoint(point, viewport, boxSize).catch(() => {})
  })
}
