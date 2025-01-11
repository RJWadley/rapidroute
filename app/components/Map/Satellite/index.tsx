import { extend } from "@pixi/react"
import { useLocalDark } from "app/utils/locals"
import type { Viewport } from "pixi-viewport"
import { ColorMatrixFilter, Container } from "pixi.js"
import { startTransition, useMemo, useState } from "react"
import { useViewportMoved } from "../Viewport"
import SatelliteLayer from "./SatelliteLayer"

extend({ Container })

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

/**
 * uses density to determine the max zoom level
 * this approach lets us keep zoom levels fairly consistent with different screen sizes
 */
const getMaxZoom = (viewport: Viewport): number => {
	const worldWidth = viewport.screenWidth
	const screenWidth = viewport.screenWidthInWorldPixels

	const density = screenWidth / worldWidth

	// return the largest zoom level where the density is smaller than the breakpoint
	for (let i = breakpoints.length - 1; i >= 0; i -= 1) {
		if (density < (breakpoints[i] ?? Number.NEGATIVE_INFINITY)) {
			return i
		}
	}

	throw new Error(
		"invalid breakpoints! at least one breakpoint must be infinite",
	)
}

export function Satellite() {
	const [maxZoomLevel, setMaxZoomLevel] = useState(0)

	useViewportMoved((viewport) => {
		const newMax = getMaxZoom(viewport)
		startTransition(() => {
			setMaxZoomLevel(newMax)
		})
	})

	const [{ isDark }] = useLocalDark()
	const filter = useMemo(() => new ColorMatrixFilter(), [])
	filter.tint(0xccccff, false)
	filter.contrast(2, true)
	filter.brightness(0.3, true)

	return (
		<pixiContainer filters={isDark ? [filter] : []}>
			{breakpoints.map((breakpoint, i) =>
				i <= maxZoomLevel ? (
					<SatelliteLayer
						key={breakpoint}
						zoomLevel={i}
						// we never want to cull the most zoomed out layer in case the user zooms out quickly
						cullable={i !== 0}
					/>
				) : null,
			)}
		</pixiContainer>
	)
}
