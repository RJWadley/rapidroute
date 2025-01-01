import { extend, useAssets } from "@pixi/react"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { Sprite, type Texture } from "pixi.js"
import { useRef } from "react"
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

extend({ Sprite })

export default function ImageTile({ x, y, zoomLevel }: ImageTileProps) {
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

	const {
		assets: [texture],
		isSuccess,
	} = useAssets<Texture>([url])
	if (texture) texture.source.scaleMode = "nearest"

	if (!isSuccess) return null
	return (
		<sprite
			key={url}
			texture={texture}
			x={x}
			y={y + VERTICAL_OFFSET}
			width={tileWidth}
			height={tileWidth}
			ref={spriteRef}
		/>
	)
}
