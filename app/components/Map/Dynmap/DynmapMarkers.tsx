import { extend } from "@pixi/react"
import invertLightness from "../../../utils/color"
import type { ColoredMarker } from "./MRTStops"
import MRTStops from "./MRTStops"
import MarkerLines from "./MarkerLines"
import { type MarkersResponse, isMRTLine } from "./dynmapType"
import { Container } from "pixi.js"
import { SCALE_FACTOR } from "../pixiUtils"
import { useSearchParamState } from "app/utils/useSearchParamState"

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
		<container scale={isometric ? { x: 1, y: SCALE_FACTOR } : { x: 1, y: 1 }}>
			<container angle={isometric ? -45 : 0}>
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
			</container>
		</container>
	)
}
