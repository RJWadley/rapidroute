import { useEffect, useMemo, useState } from "react"

import ImageTile from "./ImageTile"
import { useViewport } from "./PixiViewport"

interface SatelliteProps {
  zoomLevel: number
}

interface WorldValues {
  width: number
  height: number
  x: number
  y: number
}

export default function SatelliteLayer({ zoomLevel }: SatelliteProps) {
  const viewport = useViewport()
  const [world, setWorld] = useState<WorldValues>({
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })

  /**
   * track the world values so we can update the tiles when the world changes
   */
  useEffect(() => {
    const onChanged = () => {
      if (viewport) {
        setWorld({
          width: viewport.screenWidthInWorldPixels,
          height: viewport.screenHeightInWorldPixels,
          x: viewport.left,
          y: viewport.top,
        })
      }
    }
    onChanged()

    viewport?.addEventListener("moved", onChanged)
    return () => {
      viewport?.removeEventListener("moved", onChanged)
    }
  }, [viewport])

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
  const array = new Array<T[]>(rows)
  for (let row = 0; row < rows; row += 1) {
    array[row] = new Array<T>(columns)
    for (let column = 0; column < columns; column += 1) {
      array[row][column] = fill(row, column)
    }
  }
  return array
}
