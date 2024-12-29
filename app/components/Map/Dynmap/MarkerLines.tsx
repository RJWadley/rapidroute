import { extend } from "@pixi/react"
import { Container } from "pixi.js"
import { useRef } from "react"
import { useViewport, useViewportMoved } from "../PixiViewport"
import { hideItem, showItem } from "../pixiUtils"
import Line from "./Line"
import type { LineType } from "./dynmapType"

interface MarkerLinesProps {
	lines: LineType[]
}

function MarkerLine({
	line,
	background = false,
	debug,
}: {
	line: LineType
	background?: boolean
	debug: string | false
}) {
	const points = line.x
		.map((x, i) => {
			const z = line.z[i] ?? 0
			const y = line.y[i] ?? 0
			return { x, y, z }
		})
		.filter(Boolean)

	return (
		<Line
			debug={debug}
			points={points}
			color={background ? "#000000" : line.color}
			width={background ? 15 : 10}
		/>
	)
}

extend({ Container })

export default function MarkerLines({ lines }: MarkerLinesProps) {
	const containerRef = useRef<Container>(null)
	const viewport = useViewport()

	const updateOpacityWhenClose = () => {
		if (viewport && containerRef.current) {
			const zoom = viewport.scale.x

			const opacity = Math.max(0, Math.min(1, 1 - (zoom - 2)))
			containerRef.current.alpha = opacity
			if (opacity === 0) hideItem(containerRef.current)
			else showItem(containerRef.current)
		}
	}
	useViewportMoved(updateOpacityWhenClose)

	return (
		<container ref={containerRef}>
			{lines.map((line) => (
				<MarkerLine
					key={JSON.stringify(line)}
					line={line}
					background
					debug={false}
				/>
			))}
			{lines.map((line) => (
				<MarkerLine
					key={JSON.stringify(line)}
					line={line}
					debug={line.label.includes("Zephyr") ? line.label : false}
				/>
			))}
		</container>
	)
}
