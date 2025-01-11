import { extend, useAssets } from "@pixi/react"
import { useLocalIsometric } from "app/utils/locals"
import { Sprite, type Texture } from "pixi.js"
import getTileUrl from "./getTileURL"
import { MotionContainer } from "../MotionContainer"

/**
 * shift all the tiles by 32 blocks to align with dynmap
 */
const VERTICAL_OFFSET = -32

extend({ Sprite })

export default function ImageTile({
	x,
	y,
	zoomLevel,
}: {
	x: number
	y: number
	zoomLevel: number
}) {
	const tileWidth = 2 ** (8 - zoomLevel) * 32
	const [isometric] = useLocalIsometric()
	const url = getTileUrl({
		xIn: x / tileWidth,
		zIn: y / tileWidth,
		zoom: zoomLevel,
		isometric,
	})

	const {
		assets: [texture],
		isSuccess,
	} = useAssets<Texture>([url])
	if (texture) texture.source.scaleMode = "nearest"

	if (!isSuccess) return null
	return (
		<MotionContainer
			initial={{ alpha: 0 }}
			animate={{ alpha: 1 }}
			x={x}
			y={y + VERTICAL_OFFSET}
		>
			<pixiSprite
				key={url}
				texture={texture}
				width={tileWidth}
				height={tileWidth}
			/>
		</MotionContainer>
	)
}
