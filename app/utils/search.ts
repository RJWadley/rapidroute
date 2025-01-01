import searcher from "fuzzysort"
import type { CompressedPlace } from "./compressedPlaces"
import {
	parseCoordinate,
	parseCoordinateId,
	type Coordinate,
} from "app/data/coordinates"
import type { OnlinePlayer } from "./onlinePlayers"

const keys: Record<Exclude<keyof CompressedPlace, "coordinates">, unknown> = {
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

const playerKeys: Record<
	Exclude<keyof OnlinePlayer, "coordinates">,
	unknown
> = {
	id: true,
	name: true,
	position: true,
	type: true,
	world: true,
	x: true,
	y: true,
	z: true,
	label: true,
}

export const search = <T extends Partial<CompressedPlace>>(
	query: string | null | undefined,
	places: T[],
	onlinePlayers: OnlinePlayer[] | undefined,
) => {
	const coordinate = parseCoordinate(query)

	if (query?.startsWith("player-")) {
		const playerName = query.replace("player-", "")
		const player = onlinePlayers?.find(
			(p) => p.name.toLowerCase() === playerName.toLowerCase(),
		)
		if (player) return [{ obj: player }]
	}

	if (!query) return null
	const results = query
		? searcher.go(query, [...places.toReversed(), ...(onlinePlayers ?? [])], {
				keys: Object.keys({ ...keys, ...playerKeys }),
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
