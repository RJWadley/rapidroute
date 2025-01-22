import { useLocalIsometric } from "app/utils/locals"
import { isMRTLine, type MarkerData } from "../markers-schema"
import invertLightness from "app/utils/color"
import { SCALE_FACTOR } from "../util/isometric"
import { Container } from "pixi.js"
import { extend } from "@pixi/react"
import MRTStops from "./MRTStops"
import { useRef, useState } from "react"
import { useViewportMoved } from "../Viewport"
import MarkerLine from "./MarkerLine"
import { MotionContainer } from "../MotionContainer"

extend({ Container })

export function Dynmap({
	markers,
}: {
	markers: NonNullable<MarkerData>
}) {
	const [isometric] = useLocalIsometric()
	const wrapper = useRef<Container>(null)
	const [linesVisible, setLinesVisible] = useState(false)
	const [stopsVisible, setStopsVisible] = useState(false)

	/**
	 * parse out every individual MRT stop
	 */
	const allStops = Object.entries(markers.sets).flatMap(([name, markerSet]) => {
		if (isMRTLine(name)) {
			return Object.values(markerSet.markers).map((marker) => {
				const color = Object.values(markerSet.lines)[0]?.color ?? "black"
				const invertedColor = invertLightness(color).inverted

				return {
					marker,
					color,
					invertedColor,
				}
			})
		}
		return []
	})

	/**
	 * parse out every individual MRT line
	 */
	const allLines = Object.entries(markers.sets).flatMap(([name, markerSet]) => {
		if (isMRTLine(name)) {
			return {
				key: name,
				segments: Object.entries(markerSet.lines).map(([key, x]) => ({
					...x,
					key: `${name}${key}`,
				})),
			}
		}
		return []
	})

	useViewportMoved((viewport) => {
		if (wrapper.current) {
			const zoom = viewport.scale.x
			setStopsVisible(zoom < 2 && zoom > 0.2)
			setLinesVisible(zoom < 2)
		}
	})

	return (
		<pixiContainer
			scale={isometric ? { x: 1, y: SCALE_FACTOR } : { x: 1, y: 1 }}
		>
			<pixiContainer angle={isometric ? -45 : 0} ref={wrapper}>
				<MotionContainer animate={{ alpha: linesVisible ? 1 : 0 }}>
					{allLines.map(({ key, segments }) => (
						<MarkerLine key={key} line={segments} />
					))}
				</MotionContainer>
				<MotionContainer animate={{ alpha: stopsVisible ? 1 : 0 }}>
					<MRTStops stops={allStops} />
				</MotionContainer>
			</pixiContainer>
		</pixiContainer>
	)
}
