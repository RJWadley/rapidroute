import searcher from "fuzzysort"
import type { CompressedPlace } from "./compressedPlaces"

const keys: Record<keyof CompressedPlace, boolean> = {
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
	if (!query) return null
	return query
		? searcher.go(query, places.toReversed(), {
				keys: Object.keys(keys),
				limit: 30,
			})
		: null
}

export const findClosestPlace = <T extends Partial<CompressedPlace>>(
	query: string | null | undefined,
	places: T[],
): T | undefined => {
	if (!query) return undefined

	// directly check first
	const direct = places.find((p) => p.id?.trim() === query.trim())
	if (direct) return direct

	const results = searcher.go(query, places.toReversed(), {
		keys: Object.keys(keys),
		limit: 1,
	})

	return results?.[0]?.obj
}
