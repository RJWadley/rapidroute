import { type MarkersResponse, isMRTLine } from "(temp)/types/dynmapMarkers"
import invertLightness from "(temp)/utils/colors/invertLightness"

import type { ColoredMarker } from "./MRTStops"
import MRTStops from "./MRTStops"
import MarkerLines from "./MarkerLines"

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

	return (
		<>
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
		</>
	)
}
