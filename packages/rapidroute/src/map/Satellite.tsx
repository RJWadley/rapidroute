import { useEffect, useMemo, useState } from "react"

import { Texture } from "pixi.js"
import { Sprite } from "react-pixi-fiber"

import getTileUrl from "map/getTileURL"

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

export default function Satellite({ zoomLevel }: SatelliteProps) {
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
      if (viewport)
        setWorld({
          width: viewport.screenWidthInWorldPixels,
          height: viewport.screenHeightInWorldPixels,
          x: viewport.worldTransform.tx,
          y: viewport.worldTransform.ty,
        })
    }
    onChanged()

    viewport?.addEventListener("moved", onChanged)
    return () => {
      viewport?.removeEventListener("moved", onChanged)
    }
  }, [viewport])

  const tileWidth = 2 ** (8 - zoomLevel) * 32

  const tilesVertical = Math.ceil(world.width / tileWidth)
  const tilesHorizontal = Math.ceil(world.height / tileWidth)

  const tiles = useMemo(
    () =>
      create2DArray(tilesVertical, tilesHorizontal, (row, column) => {
        const tileX = Math.floor((column * tileWidth) / tileWidth)
        const tileY = Math.floor((row * tileWidth) / tileWidth)

        const tile = getTileUrl({
          x: tileX,
          z: tileY,
          zoom: zoomLevel,
        })

        if (!tile) return null

        return (
          <Sprite
            key={`${tileX},${tileY},${zoomLevel}`}
            texture={Texture.from(tile.url)}
            width={tileWidth}
            height={tileWidth}
            x={column * tileWidth}
            y={row * tileWidth}
          />
        )
      }),
    [tileWidth, tilesHorizontal, tilesVertical, zoomLevel]
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
