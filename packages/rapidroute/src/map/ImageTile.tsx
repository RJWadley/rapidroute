import { useEffect, useState } from "react"

import { Texture } from "pixi.js"
import { Sprite } from "react-pixi-fiber"

import getTileUrl from "./getTileURL"
import { worldSize } from "./PixiViewport"

interface ImageTileProps {
  x: number
  y: number
  zoomLevel: number
}

export default function ImageTile({ x, y, zoomLevel }: ImageTileProps) {
  const [textureExists, setTextureExists] = useState<boolean>(false)

  const tileWidth = 2 ** (8 - zoomLevel) * 32
  const tile = getTileUrl({
    xIn: x / tileWidth,
    zIn: y / tileWidth,
    zoom: zoomLevel,
  })

  // do a rough check on the tile to see if it's in the world
  const absoluteX = Math.abs(x)
  const absoluteY = Math.abs(y)
  const radius = worldSize / 2
  const buffer = tileWidth
  const skipThisTile =
    absoluteX > radius + buffer || absoluteY > radius + buffer

  /**
   * check if the image exists by attempting to load it into a texture
   */
  useEffect(() => {
    if (skipThisTile) return
    let isMounted = true
    Texture.fromURL(tile.url)
      .then(() => {
        if (isMounted) setTextureExists(true)
      })
      .catch(() => {
        // generally, this just means the tile isn't available
      })

    return () => {
      isMounted = false
    }
  }, [skipThisTile, tile.url])

  if (!textureExists) return null
  if (skipThisTile) return null
  return (
    <Sprite
      texture={Texture.from(tile.url)}
      x={x}
      y={y}
      width={tileWidth}
      height={tileWidth}
    />
  )
}
