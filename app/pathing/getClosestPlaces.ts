import type { Place } from "app/data"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { getDistance } from "app/utils/getDistance"

export const getClosestPlaces = <T extends Place | CompressedPlace>(
	[x, z]: readonly [x: number, z: number],
	places: T[],
): { place: T; distance: number }[] => {
	/**
	 * return the 5 closest places to the given location
	 */
	const closestPlaces = places
		.map((place) => ({
			place,
			distance: place.coordinates
				? getDistance(x, z, place.coordinates[0], place.coordinates[1]) || 1
				: Number.POSITIVE_INFINITY,
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, 10)

	return closestPlaces
}
