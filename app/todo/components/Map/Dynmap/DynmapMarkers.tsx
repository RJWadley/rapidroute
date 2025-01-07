import { extend } from "@pixi/react"
import { useSearchParamState } from "app/todo/utils/useSearchParamState"
import { Container } from "pixi.js"
import invertLightness from "../../../utils/color"
import { SCALE_FACTOR } from "../pixiUtils"
import type { ColoredMarker } from "./MRTStops"
import MRTStops from "./MRTStops"
import MarkerLines from "./MarkerLines"
import { type MarkersResponse, isMRTLine } from "./dynmapType"

extend({ Container })

export default function DynmapMarkers({
	initialMarkers,
}: {
	initialMarkers: MarkersResponse
}) {
	const markerSets = initialMarkers.sets

	const allStops: ColoredMarker[] = Object.keys(markerSets).flatMap((name) => {
		if (isMRTLine(name)) {
			return Object.values(markerSets[name].markers).map((marker) => {
				const color = Object.values(markerSets[name].lines)[0]?.color ?? "black"
				const invertedColor = invertLightness(color)
				return {
					marker,
					color,
					invertedColor,
				}
			})
		}
		return []
	})

	const [isometric] = useSearchParamState("isometric")

	return (
		<pixiContainer
			scale={isometric ? { x: 1, y: SCALE_FACTOR } : { x: 1, y: 1 }}
		>
			<pixiContainer angle={isometric ? -45 : 0}>
				{Object.keys(markerSets).map((name) => {
					if (isMRTLine(name))
						return (
							<MarkerLines
								key={name}
								lines={Object.values(markerSets[name].lines)}
							/>
						)
					return null
				})}
				<MRTStops stops={allStops} />
			</pixiContainer>
		</pixiContainer>
	)
}
