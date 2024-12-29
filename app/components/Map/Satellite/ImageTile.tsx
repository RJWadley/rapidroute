import { extend } from "@pixi/react"
import { Assets, Sprite, Texture } from "pixi.js"
import { useEffect, useRef, useState } from "react"
import getTileUrl from "./getTileURL"
import { useSearchParamState } from "app/utils/useSearchParamState"

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

extend({ Sprite })

export default function ImageTile({ x, y, zoomLevel }: ImageTileProps) {
	const [texture, setTexture] = useState<Texture>()
	const spriteRef = useRef<Sprite>(null)

	const tileWidth = 2 ** (8 - zoomLevel) * 32
	const [isometric] = useSearchParamState("isometric")
	const url = getTileUrl(
		{
			xIn: x / tileWidth,
			zIn: y / tileWidth,
			zoom: zoomLevel,
		},
		!!isometric,
	)

	// do a rough check on the tile to see if it's in the world
	// const absoluteX = Math.abs(x)
	// const absoluteY = Math.abs(y)
	// const radius = worldSize / 2
	// const buffer = tileWidth
	// const skipThisTile =
	// 	absoluteX > radius + buffer || absoluteY > radius + buffer

	/**
	 * check if the image exists by attempting to load it into a texture
	 */
	useEffect(() => {
		if (textureCache[url]) {
			setTexture(textureCache[url])
			return
		}

		// if (skipThisTile) return
		let isMounted = true
		Assets.load(url)
			.then(() => {
				if (!isMounted) return null
				const newTexture = Texture.from(url)
				textureCache[url] = newTexture
				newTexture.source.scaleMode = "nearest"
				setTexture(newTexture)
				return null
			})
			.catch(() => {
				// generally, this just means the tile isn't available
			})

		return () => {
			isMounted = false
		}
	}, [url])

	const textureToRender = textureCache[url] ?? texture

	if (!textureToRender) return null
	// if (skipThisTile) return null

	return (
		<sprite
			key={url}
			texture={textureToRender}
			x={x}
			y={y + VERTICAL_OFFSET}
			width={tileWidth}
			height={tileWidth}
			ref={spriteRef}
		/>
	)
}
