import { extend, useAssets } from "@pixi/react"
import { useLocalIsometric } from "app/utils/locals"
import type { OnlinePlayer } from "app/utils/onlinePlayers"
import {
	Container,
	Matrix,
	Sprite,
	Text,
	TextStyle,
	type Texture,
} from "pixi.js"
import { useRef, useState } from "react"
import { useViewportMoved } from "../Viewport"
import { convertPointToIsometric } from "../util/isometric"

extend({ Sprite, Text, Container })

export default function MapPlayer({ player }: { player: OnlinePlayer }) {
	const containerRef = useRef<Container>(null)
	const [isometric] = useLocalIsometric()
	const [isHover, setIsHover] = useState(false)

	const {
		assets: [head],
		isSuccess,
	} = useAssets<Texture>([
		{ src: `https://mc-heads.net/avatar/${player.name}.png` },
	])

	/**
	 * update the head size and name offset
	 */
	useViewportMoved((viewport) => {
		if (!containerRef.current) return null

		const scaleToUse = Math.max(0.05, viewport.scale.x)
		containerRef.current.scale = 1 / scaleToUse
	})

	const skewed = isometric
		? convertPointToIsometric(player)
		: { x: player.x, z: player.z }
	const enter = () => setIsHover(true)
	const leave = () => setIsHover(false)

	if (!isSuccess) return null
	return (
		<pixiContainer
			eventMode="static"
			cursor="pointer"
			onPointerEnter={enter}
			onMouseLeave={leave}
			onTouchEnd={() => setTimeout(leave, 3000)}
			cullable
			x={skewed.x}
			y={skewed.z}
			ref={containerRef}
		>
			<pixiGraphics
				draw={(g) => {
					// draw a rectangle with rounded corners from x-20 y-20 to x+20 y+20
					const size = 10
					const borderRadius = 3
					g.beginPath()

					g.moveTo(-size + borderRadius, -size)
					g.lineTo(size - borderRadius, -size)
					g.quadraticCurveTo(size, -size, size, -size + borderRadius)

					g.lineTo(size, size - borderRadius)
					g.quadraticCurveTo(size, size, size - borderRadius, size)

					g.lineTo(-size + borderRadius, size)
					g.quadraticCurveTo(-size, size, -size, size - borderRadius)

					g.lineTo(-size, -size + borderRadius)
					g.quadraticCurveTo(-size, -size, -size + borderRadius, -size)

					g.lineTo(0, -size)
					g.closePath()

					// fill the rectangle with the texture
					g.setFillStyle({
						texture: head,
						matrix: new Matrix()
							.scale(size / 180, size / 180)
							.translate(size / 2, size / 2)
							.scale(2, 2),
					})
					g.fill()
				}}
			/>
			<pixiText
				anchor={{ x: 0, y: 0.5 }}
				x={20}
				y={-1}
				text={player.name}
				style={playerStyle}
			/>
		</pixiContainer>
	)
}

const playerStyle = new TextStyle({
	fill: "hsl(50, 90%, 95%)",
	stroke: {
		width: 3,
		color: "hsl(50, 90%, 10%)",
		miterLimit: 4,
		cap: "round",
	},
	fontFamily: "Inter, Arial",
	fontSize: 20,
	fontWeight: "500",
	align: "center",
})
