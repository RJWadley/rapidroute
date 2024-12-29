import { extend } from "@pixi/react"
import { Graphics } from "pixi.js"
import { shiftWorldCoordinate } from "../pixiUtils"
import { useSearchParamState } from "app/utils/useSearchParamState"

interface LineProps {
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
	debug: string | false
}

extend({ Graphics })

export default function Line({ points, color, width = 10, debug }: LineProps) {
	const [isometric] = useSearchParamState("isometric")
	return (
		<graphics
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
					? shiftWorldCoordinate(firstPoint.x, firstPoint.y, firstPoint.z)
					: firstPoint
				g.moveTo(start.x, start.z)
				for (const { x, y, z } of points) {
					const skewed = isometric ? shiftWorldCoordinate(x, y, z) : { x, z }
					g.lineTo(skewed.x, skewed.z)
				}
				g.stroke()
			}}
			cullable
		/>
	)
}
