import type { Viewport } from "pixi-viewport"
import { startTransition, useState } from "react"

import { useViewport, useViewportMoved } from "../PixiViewport"
import SatelliteLayer from "./SatelliteLayer"
import { useSearchParamState } from "app/utils/useSearchParamState"

const breakpoints = [
	Number.POSITIVE_INFINITY,
	30,
	15,
	7.5,
	3.75,
	1.875,
	0.9375,
	0.468_75,
	0.234_375,
]

const getMaxZoom = (viewport: Viewport | null): number => {
	const worldWidth = viewport?.screenWidth ?? 0
	const screenWidth = viewport?.screenWidthInWorldPixels ?? 0

	const density = screenWidth / worldWidth

	// return the largest zoom level where the density is smaller than the breakpoint
	for (let i = breakpoints.length - 1; i >= 0; i -= 1) {
		if (density < (breakpoints[i] ?? Number.NEGATIVE_INFINITY)) {
			return i
		}
	}
	return 99
}

export default function Satellite() {
	const [maxZoom, setMaxZoom] = useState(0)
	const viewport = useViewport()

	const updateSatelliteBounds = () => {
		const newMax = getMaxZoom(viewport)
		startTransition(() => {
			setMaxZoom(newMax)
		})
	}
	useViewportMoved(updateSatelliteBounds)

	// TODO - post react 19 upgrade I want to go back and refactor initial load timing
	// gonna move on for now though

	const [isometric] = useSearchParamState("isometric")

	return (
		<>
			{breakpoints.map(
				(breakpoint, i) =>
					i <= maxZoom && (
						<SatelliteLayer key={breakpoint} zoomLevel={i} dynamic={i !== 0} />
					),
			)}
		</>
	)
}
