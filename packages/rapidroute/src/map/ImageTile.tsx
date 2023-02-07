import { useEffect, useState } from "react"

import { Texture } from "pixi.js"
import { Sprite } from "react-pixi-fiber"

import getTileUrl from "./getTileURL"

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

  /**
   * check if the image exists by attempting to load it into a texture
   */
  useEffect(() => {
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
  }, [tile.url])

  if (!textureExists) return null
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
