import { Sprite } from "@pixi/react"
import { gsap } from "gsap"
import type { Sprite as PixiSprite } from "pixi.js"
import { Assets, SCALE_MODES, Texture } from "pixi.js"
import { useEffect, useRef, useState } from "react"

import { worldSize } from "../PixiViewport"
import getTileUrl from "./getTileURL"

interface ImageTileProps {
  x: number
  y: number
  zoomLevel: number
}

/**
 * shift all the tiles by 32 blocks to align with dynmap
 */
const VERTICAL_OFFSET = -32

const textureCache: Record<string, Texture> = {}

export default function ImageTile({ x, y, zoomLevel }: ImageTileProps) {
  const [texture, setTexture] = useState<Texture>()
  const [needsAnimation, setNeedsAnimation] = useState(true)
  const spriteRef = useRef<PixiSprite>(null)

  const tileWidth = 2 ** (8 - zoomLevel) * 32
  const url = getTileUrl({
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
    if (textureCache[url]) {
      setTexture(textureCache[url])
      setNeedsAnimation(false)
      return
    }

    if (skipThisTile) return
    let isMounted = true
    Assets.load(url)
      .then(async () =>
        // give low zoom tiles a chance to load first
        zoomLevel === 0
          ? null
          : new Promise((resolve) => {
              setTimeout(resolve, 8)
            }),
      )
      .then(() => {
        if (!isMounted) return null
        const newTexture = Texture.from(url)
        textureCache[url] = newTexture
        newTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST
        setTexture(newTexture)
        return null
      })
      .catch(() => {
        // generally, this just means the tile isn't available
      })

    return () => {
      isMounted = false
    }
  }, [skipThisTile, url, zoomLevel])

  /**
   * animate in
   */
  useEffect(() => {
    if (!texture || skipThisTile) return
    if (needsAnimation) gsap.to(spriteRef.current, { alpha: 1 })
    else gsap.set(spriteRef.current, { alpha: 1 })
  }, [texture, skipThisTile, needsAnimation])

  const textureToRender = textureCache[url] ?? texture

  if (!textureToRender) return null
  if (skipThisTile) return null

  return (
    <Sprite
      key={url}
      texture={textureToRender}
      x={x}
      y={y + VERTICAL_OFFSET}
      width={tileWidth}
      height={tileWidth}
      ref={spriteRef}
      alpha={zoomLevel === 0 ? 1 : 0}
    />
  )
}
