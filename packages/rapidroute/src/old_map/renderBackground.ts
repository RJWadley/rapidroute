import { fabric } from "fabric"

import getTileUrl from "map/getTileURL"
import { session } from "utils/localUtils"

const tilesMap: Record<string, HTMLImageElement> = {}
const densityBreakpoints = [Infinity, 50, 15, 8, 4, 2, 1, 0.5, 0.25]
let isActive = false

export default function renderBackground(canvas: fabric.Canvas) {
  isActive = true
  // get the bounds of the canvas viewport
  const bounds = canvas.calcViewportBoundaries()

  // determine the canvas width
  const canvasWidth = bounds.br.x - bounds.tl.x
  const canvasUnitsPerPixelW = canvasWidth / canvas.getWidth()
  const canvasHeight = bounds.br.y - bounds.tl.y
  const canvasUnitsPerPixelH = canvasHeight / canvas.getHeight()
  const canvasUnitsPerPixel = Math.max(
    canvasUnitsPerPixelH,
    canvasUnitsPerPixelW
  )

  for (let i = 0; i <= 8; i += 1) {
    if (densityBreakpoints[i] && canvasUnitsPerPixel < densityBreakpoints[i]) {
      renderTilesInRange(bounds, i, canvas)
    }
  }

  return () => {
    isActive = false
  }
}

function renderTilesInRange(
  bounds: {
    tl: fabric.Point
    br: fabric.Point
    tr: fabric.Point
    bl: fabric.Point
  },
  zoom: number,
  canvas: fabric.Canvas
) {
  const tileWidth = 2 ** (8 - zoom) * 32
  const ctx = canvas.getContext()

  const debugOffset = session.isDebug ? 100 / canvas.getZoom() : 0
  const verticalOffset = 32

  const onImageLoad = () => {
    if (isActive) canvas.requestRenderAll()
  }

  // start at the top left corner of the canvas and iterate over the tiles, drawing them one by one
  for (
    let x = Math.floor((bounds.tl.x + debugOffset) / tileWidth) * tileWidth;
    x < bounds.br.x - debugOffset;
    x += tileWidth
  ) {
    for (
      let y =
        Math.floor((bounds.tl.y + debugOffset + verticalOffset) / tileWidth) *
        tileWidth;
      y < bounds.br.y - debugOffset + verticalOffset;
      y += tileWidth
    ) {
      const tile = getTileUrl({ xIn: x / tileWidth, zIn: y / tileWidth, zoom })
      if (tile) {
        const imageOrigin = fabric.util.transformPoint(
          new fabric.Point(x, y - verticalOffset),
          canvas.viewportTransform || []
        )
        const renderedImageWidth = tileWidth * canvas.getZoom()
        if (!tilesMap[tile.id]) {
          const img = new Image()
          img.src = tile.url
          tilesMap[tile.id] = img
          img.onload = onImageLoad
        }
        // check if the image is loaded and not broken
        if (
          tilesMap[tile.id].complete &&
          tilesMap[tile.id].naturalHeight !== 0
        ) {
          ctx.drawImage(
            tilesMap[tile.id],
            imageOrigin.x,
            imageOrigin.y,
            renderedImageWidth,
            renderedImageWidth
          )
        }
      }
    }
  }
}
