import { extend } from "@pixi/react"
import { Graphics } from "pixi.js"

interface LineProps {
	/**
	 * the color of the line as a hex code, eg #123456
	 */
	color: string
	points: {
		x: number
		z: number
	}[]
	width?: number
}

extend({ Graphics })

export default function Line({ points, color, width = 10 }: LineProps) {
	return (
		<graphics
			draw={(g) => {
				const colorAsHex = Number.parseInt(color.replace("#", ""), 16)

				g.setStrokeStyle({
					color: colorAsHex,
					cap: "round",
					join: "round",
					width,
				})
				g.moveTo(points[0]?.x ?? 0, points[0]?.z ?? 0)
				for (const { x, z } of points) {
					g.lineTo(x, z)
				}
				g.stroke()
			}}
			cullable
		/>
	)
}
