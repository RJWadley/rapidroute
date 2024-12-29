import type { DataType } from "app/data"
import { getDistance } from "app/utils/getDistance"

export const getClosestPlaces = (
	[x, z]: [x: number, z: number],
	data: DataType,
) => {
	const { places } = data

	/**
	 * return the 5 closest places to the given location
	 */
	const closestPlaces = places.list
		.map((place) => ({
			place,
			distance: place.coordinates
				? getDistance(x, z, place.coordinates[0], place.coordinates[1])
				: Number.POSITIVE_INFINITY,
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, 10)

	return closestPlaces
}
