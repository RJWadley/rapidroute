import { extend, useAssets } from "@pixi/react"
import { useViewport, useViewportMoved } from "./PixiViewport"

import { Container, Point, Sprite, Text, type Texture } from "pixi.js"
import type { OnlinePlayer } from "app/utils/onlinePlayers"
import { useRef, useState } from "react"
import { regular, regularHover } from "./textStyles"

extend({ Sprite, Text, Container })

export default function MapPlayer({ player }: { player: OnlinePlayer }) {
	const viewport = useViewport()
	const headRef = useRef<Sprite>(null)
	const textRef = useRef<Text>(null)
	const [hover, setHover] = useState(false)

	const {
		assets: [head],
		isSuccess,
	} = useAssets<Texture>([
		{
			src: `https://mc-heads.net/avatar/${player.name}.png`,
		},
	])

	/**
	 * update the head size and name offset
	 */
	const updatePlayerHeadSize = () => {
		if (!viewport) return
		if (!headRef.current) return null
		if (!textRef.current) return null

		const blocksPerPixel =
			viewport.screenWidthInWorldPixels / viewport.screenWidth
		const preferredSize = 20 * blocksPerPixel
		const size = Math.max(8, preferredSize)
		headRef.current.width = size
		headRef.current.height = size
		textRef.current.scale = new Point(
			1 / viewport.scale.x,
			1 / viewport.scale.y,
		)
		const newAdjustment = (8 - Math.min(8, preferredSize)) * 0.2
		textRef.current.anchor.y = 1.5 + newAdjustment ** 3
	}
	useViewportMoved(updatePlayerHeadSize)

	const pointerIn = () => {
		setHover(true)
	}
	const pointerOut = () => {
		setHover(false)
	}

	if (!isSuccess) return null
	return (
		<container
			eventMode="static"
			cursor="pointer"
			onPointerEnter={pointerIn}
			onPointerLeave={pointerOut}
			onTouchStart={pointerIn}
			onTouchEnd={() => {
				pointerOut()
			}}
			cullable
			x={player.coordinates[0]}
			y={player.coordinates[1]}
		>
			<sprite
				texture={head}
				anchor={0.5}
				ref={headRef}
				width={100}
				height={100}
			/>
			<pixiText
				anchor={{ x: 0.5, y: 1.5 }}
				text={player.name}
				style={hover ? regularHover : regular}
				ref={textRef}
			/>
		</container>
	)
}
