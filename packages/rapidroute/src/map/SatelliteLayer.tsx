import { startTransition, useMemo, useRef, useState } from "react"

import useIsMounted from "utils/useIsMounted"

import ImageTile from "./ImageTile"
import { useViewport, useViewportMoved, worldSize } from "./PixiViewport"

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
  const [world, setWorld] = useState<WorldValues>({
    width: dynamic ? 100 : worldSize,
    height: dynamic ? 100 : worldSize,
    x: dynamic ? 0 : -halfSize,
    y: dynamic ? 0 : -halfSize,
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
          setWorld({
            width: viewport.screenWidthInWorldPixels,
            height: viewport.screenHeightInWorldPixels,
            x: viewport.left,
            y: viewport.top,
          })
      })
      setTimeout(() => {
        cooldown.current = false
        if (pending.current) onChanged()
        pending.current = false
      }, 1000 + 1000 * Math.random())
    } else if (dynamic) {
      pending.current = true
    }
  }
  useViewportMoved(onChanged)

  const tileWidth = 2 ** (8 - zoomLevel) * 32
  const tilesVertical = Math.ceil(world.height / tileWidth) + 1
  const tilesHorizontal = Math.ceil(world.width / tileWidth) + 1

  const startingX = Math.floor(world.x / tileWidth)
  const startingY = Math.floor(world.y / tileWidth)

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
    [startingX, startingY, tileWidth, tilesHorizontal, tilesVertical, zoomLevel]
  )

  return <>{tiles}</>
}

const create2DArray = <T,>(
  rows: number,
  columns: number,
  fill: (row: number, column: number) => T
) => {
  if (Number.isNaN(rows) || Number.isNaN(columns)) return []
  const array: T[][] = []
  for (let row = 0; row < rows; row += 1) {
    array[row] = []
    for (let column = 0; column < columns; column += 1) {
      array[row][column] = fill(row, column)
    }
  }
  return array.flat()
}
