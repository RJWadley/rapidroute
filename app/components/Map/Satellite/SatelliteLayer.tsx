import { useLocalIsometric } from "app/utils/locals"
import { startTransition, useState } from "react"
import { WORLD_SIZE, useViewportMoved } from "../Viewport"
import ImageTile from "./ImageTile"
import { useBetterThrottle } from "app/utils/useBetterThrottle"

const CLIP_SIZE = WORLD_SIZE * 1.4
const HALF_CLIP_SIZE = CLIP_SIZE / 2

export default function SatelliteLayer({
	zoomLevel,
	cullable,
}: {
	zoomLevel: number
	cullable: boolean
}) {
	const [isometric] = useLocalIsometric()
	const [viewportBoundsRaw, setViewportBounds] = useState(
		// if we're culling this zoom level, these values will be overwritten immediately
		// if we're not culling, we'll use the largest viewport bounds possible
		cullable
			? null
			: {
					width: CLIP_SIZE,
					height: CLIP_SIZE,
					x: -HALF_CLIP_SIZE,
					y: -HALF_CLIP_SIZE,
				},
	)
	const viewportBounds = useBetterThrottle(viewportBoundsRaw, 1000)

	/**
	 * track the world values so we can update the tiles when the world changes
	 */
	useViewportMoved((viewport) => {
		if (cullable)
			startTransition(() => {
				setViewportBounds({
					width: viewport.screenWidthInWorldPixels,
					height: viewport.screenHeightInWorldPixels,
					x: viewport.left,
					y: viewport.top,
				})
			})
	})

	if (!viewportBounds) return null

	const tileWidth = 2 ** (8 - zoomLevel) * 32
	const tilesVertical = Math.ceil(viewportBounds.height / tileWidth) + 1
	const tilesHorizontal = Math.ceil(viewportBounds.width / tileWidth) + 1

	const startingX = Math.floor(viewportBounds.x / tileWidth)
	const startingY = Math.floor(viewportBounds.y / tileWidth)

	return create2DArray(tilesVertical, tilesHorizontal, (row, column) => {
		const tileX = startingX + column
		const tileY = startingY + row

		if (Number.isNaN(tileX) || Number.isNaN(tileY)) return null

		return (
			<ImageTile
				key={`${isometric}:${tileX},${tileY},${zoomLevel}`}
				x={tileX * tileWidth}
				y={tileY * tileWidth}
				zoomLevel={zoomLevel}
			/>
		)
	})
}

const create2DArray = <T,>(
	rows: number,
	columns: number,
	fill: (row: number, column: number) => T,
) => {
	if (Number.isNaN(rows) || Number.isNaN(columns)) return []
	const array = Array.from({ length: rows }, (_, row) =>
		Array.from({ length: columns }, (__, column) => fill(row, column)),
	)
	return array.flat()
}
