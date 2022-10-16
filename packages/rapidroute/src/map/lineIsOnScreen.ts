import { fabric } from "fabric"

import { session } from "utils/localUtils"

/**
 * checks if the line between two points intersects the canvas viewport
 */
export default function lineIsOnScreen(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  canvas: fabric.Canvas,
  lineWidth: number = 0
) {
  const debugCull = session.isDebug ? 100 / canvas.getZoom() : 0
  const viewPort = canvas.calcViewportBoundaries()
  const minX = viewPort.tl.x + debugCull - lineWidth
  const maxX = viewPort.br.x - debugCull + lineWidth
  const minY = viewPort.tl.y + debugCull - lineWidth
  const maxY = viewPort.br.y - debugCull + lineWidth

  const x1 = p1.x
  const y1 = p1.y
  const x2 = p2.x
  const y2 = p2.y

  // check if the line is completely outside the viewport
  if (x1 < minX && x2 < minX) return false
  if (x1 > maxX && x2 > maxX) return false
  if (y1 < minY && y2 < minY) return false
  if (y1 > maxY && y2 > maxY) return false

  // check if the line is completely inside the viewport
  if (x1 > minX && x1 < maxX && x2 > minX && x2 < maxX) return true
  if (y1 > minY && y1 < maxY && y2 > minY && y2 < maxY) return true

  // check if the line intersects the viewport
  const m = (y2 - y1) / (x2 - x1)
  const b = y1 - m * x1

  const xIntersect1 = (minY - b) / m
  const xIntersect2 = (maxY - b) / m
  const yIntersect1 = m * minX + b
  const yIntersect2 = m * maxX + b

  if (xIntersect1 > minX && xIntersect1 < maxX) return true
  if (xIntersect2 > minX && xIntersect2 < maxX) return true
  if (yIntersect1 > minY && yIntersect1 < maxY) return true
  if (yIntersect2 > minY && yIntersect2 < maxY) return true

  return false
}
