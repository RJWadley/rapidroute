import { startTransition, useMemo, useRef, useState } from "react"
import useIsMounted from "utils/useIsMounted"

import { useViewport, useViewportMoved, worldSize } from "../PixiViewport"
import ImageTile from "./ImageTile"

interface SatelliteProps {
  zoomLevel: number
  dynamic?: boolean
}

interface WorldValues {
  width: number
  height: number
  x: number
  y: number
}

export default function SatelliteLayer({
  zoomLevel,
  dynamic = false,
}: SatelliteProps) {
  const viewport = useViewport()
  const halfSize = worldSize / 2
  const [viewportBounds, setViewportBounds] = useState<WorldValues>({
    width: dynamic ? 200 : worldSize,
    height: dynamic ? 200 : worldSize,
    x: dynamic ? -100 : -halfSize,
    y: dynamic ? -100 : -halfSize,
  })

  /**
   * track the world values so we can update the tiles when the world changes
   */
  const cooldown = useRef(false)
  const pending = useRef(false)
  const isMounted = useIsMounted()
  const onChanged = () => {
    if (viewport && dynamic && !cooldown.current) {
      cooldown.current = true
      startTransition(() => {
        if (isMounted.current)
          setViewportBounds({
            width: viewport.screenWidthInWorldPixels,
            height: viewport.screenHeightInWorldPixels,
            x: viewport.left,
            y: viewport.top,
          })
      })
      setTimeout(
        () => {
          cooldown.current = false
          if (pending.current) onChanged()
          pending.current = false
        },
        1000 + 1000 * Math.random(),
      )
    } else if (dynamic) {
      pending.current = true
    }
  }
  useViewportMoved(onChanged)

  const tileWidth = 2 ** (8 - zoomLevel) * 32
  const tilesVertical = Math.ceil(viewportBounds.height / tileWidth) + 1
  const tilesHorizontal = Math.ceil(viewportBounds.width / tileWidth) + 1

  const startingX = Math.floor(viewportBounds.x / tileWidth)
  const startingY = Math.floor(viewportBounds.y / tileWidth)

  const tiles = useMemo(
    () =>
      create2DArray(tilesVertical, tilesHorizontal, (row, column) => {
        const tileX = startingX + column
        const tileY = startingY + row

        if (Number.isNaN(tileX) || Number.isNaN(tileY)) return null

        return (
          <ImageTile
            key={`${tileX},${tileY},${zoomLevel}`}
            x={tileX * tileWidth}
            y={tileY * tileWidth}
            zoomLevel={zoomLevel}
          />
        )
      }),
    [
      startingX,
      startingY,
      tileWidth,
      tilesHorizontal,
      tilesVertical,
      zoomLevel,
    ],
  )

  return <>{tiles}</>
}

const create2DArray = <T,>(
  rows: number,
  columns: number,
  fill: (row: number, column: number) => T,
) => {
  if (Number.isNaN(rows) || Number.isNaN(columns)) return []
  const array = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (__, column) => fill(row, column)),
  )
  return array.flat()
}
