import searcher from "fuzzysort"
import type { CompressedPlace } from "./compressedPlaces"
import {
	parseCoordinate,
	parseCoordinateId,
	type Coordinate,
} from "app/data/coordinates"

const keys: Record<Exclude<keyof CompressedPlace, "coordinates">, boolean> = {
	codes: true,
	company: true,
	deputy_mayor: true,
	mayor: true,
	name: true,
	id: true,
	rank: true,
	type: true,
	world: true,
}

export const search = <T extends Partial<CompressedPlace>>(
	query: string | null | undefined,
	places: T[],
) => {
	const coordinate = parseCoordinate(query)

	if (!query) return null
	const results = query
		? searcher.go(query, places.toReversed(), {
				keys: Object.keys(keys),
				limit: 30,
			})
		: null

	if (results && coordinate) return [{ obj: coordinate }, ...results]
	if (results) return results
	if (coordinate) return [{ obj: coordinate }]

	return null
}

export const findClosestPlace = <T extends Partial<CompressedPlace>>(
	query: string | null | undefined,
	places: T[],
): T | Coordinate | undefined => {
	if (!query) return undefined

	// directly check first
	const direct = places.find((p) => p.id?.trim() === query.trim())
	if (direct) return direct

	const coord = parseCoordinateId(query)
	if (coord) return coord

	const results = searcher.go(query, places.toReversed(), {
		keys: Object.keys(keys),
		limit: 1,
	})

	return results?.[0]?.obj
}
