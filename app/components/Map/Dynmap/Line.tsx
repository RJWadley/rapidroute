import { extend } from "@pixi/react"

import { Graphics } from "pixi.js"
import { useLocalIsometric } from "app/utils/locals"
import { shiftWorldCoordinateToIsometric } from "../util/isometric"

extend({ Graphics })

export default function Line({
	points,
	color,
	width = 10,
}: {
	/**
	 * the color of the line as a hex code, eg #123456
	 */
	color: string
	points: {
		x: number
		y: number
		z: number
	}[]
	width?: number
}) {
	const [isometric] = useLocalIsometric()

	return (
		<pixiGraphics
			draw={(g) => {
				const colorAsHex = Number.parseInt(color.replace("#", ""), 16)

				g.clear()
				g.setStrokeStyle({
					color: colorAsHex,
					cap: "round",
					join: "round",
					width,
				})

				const [firstPoint] = points
				if (!firstPoint) return

				const start = isometric
					? shiftWorldCoordinateToIsometric(firstPoint)
					: firstPoint
				g.moveTo(start.x, start.z)

				for (const { x, y, z } of points) {
					const skewed = isometric
						? shiftWorldCoordinateToIsometric({ x, y, z })
						: { x, z }

					g.lineTo(skewed.x, skewed.z)
				}
				g.stroke()
			}}
			cullable
		/>
	)
}
