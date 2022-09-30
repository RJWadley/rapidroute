import { fabric } from "fabric"

import getTileUrl from "./getTileURL"

const tilesMap: Record<string, HTMLImageElement> = {}

const densityBreakpoints = [101, 34, 15, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05]

export default function renderBackground(canvas: fabric.Canvas) {
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

  //   start at the top left corner of the canvas and iterate over the tiles, drawing them one by one
  for (
    let x = Math.floor(bounds.tl.x / tileWidth) * tileWidth;
    x < bounds.br.x;
    x += tileWidth
  ) {
    for (
      let y = Math.floor(bounds.tl.y / tileWidth) * tileWidth;
      y < bounds.br.y;
      y += tileWidth
    ) {
      const tile = getTileUrl({ x: x / tileWidth, z: y / tileWidth, zoom })
      const ctx = canvas.getContext()
      const imageOrigin = fabric.util.transformPoint(
        new fabric.Point(x, y),
        canvas.viewportTransform || []
      )
      const renderedImageWidth = tileWidth * canvas.getZoom()
      if (!tilesMap[tile.id]) {
        const img = new Image()
        img.src = tile.url
        tilesMap[tile.id] = img
        img.onload = () => {
          canvas.requestRenderAll()
        }
      }
      // check if the image is loaded and not broken
      if (tilesMap[tile.id].complete && tilesMap[tile.id].naturalHeight !== 0) {
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
