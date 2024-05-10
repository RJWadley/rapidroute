import { Graphics } from "@pixi/react"
import type { Graphics as PixiGraphics } from "pixi.js"
import { LINE_CAP, LINE_JOIN } from "pixi.js"

interface LineProps {
	/**
	 * the color of the line as a hex code, eg #123456
	 */
	color: string
	points: {
		x: number
		z: number
	}[]
	background?: boolean
}

const renderPoints = ({
	graphics,
	points,
	color,
	native,
	width = 10,
}: {
	graphics: PixiGraphics
	points: LineProps["points"]
	color: string
	native: boolean
	width?: number
}) => {
	const colorAsHex = Number.parseInt(color.replace("#", ""), 16)

	graphics.lineStyle({
		color: colorAsHex,
		cap: LINE_CAP.ROUND,
		join: LINE_JOIN.ROUND,
		width,
		native,
	})
	graphics.moveTo(points[0]?.x ?? 0, points[0]?.z ?? 0)
	points.forEach(({ x, z }) => {
		graphics.lineTo(x, z)
	})
}

export default function Line({ points, color, background = false }: LineProps) {
	return (
		<Graphics
			draw={(graphics) => {
				renderPoints({
					graphics,
					points,
					color: background ? "#000000" : color,
					native: false,
					width: background ? 15 : 10,
				})
				if (!background) renderPoints({ graphics, points, color, native: true })
			}}
			cullable
		/>
	)
}
