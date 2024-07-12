import { useRef } from "react"

import { useViewport, useViewportMoved } from "../PixiViewport"
import Line from "./Line"
import type { LineType } from "./dynmapType"
import { Container } from "pixi.js"
import { hideItem, showItem } from "../pixiUtils"
import { extend } from "@pixi/react"

interface MarkerLinesProps {
	lines: LineType[]
}

function MarkerLine({
	line,
	background = false,
}: {
	line: LineType
	background?: boolean
}) {
	const points = line.x.map((x, i) => ({
		x,
		z: line.z[i] ?? 0,
	}))

	return (
		<Line
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
				<MarkerLine key={JSON.stringify(line)} line={line} background />
			))}
			{lines.map((line) => (
				<MarkerLine key={JSON.stringify(line)} line={line} />
			))}
		</container>
	)
}
