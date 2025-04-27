import {
	type Coordinate,
	parseCoordinate,
	parseCoordinateId,
} from "app/data/coordinates"
import searcher from "fuzzysort"
import type { CompressedPlace } from "./compressedPlaces"
import type { OnlinePlayer, Player } from "app/api/players/type"

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
	Exclude<keyof OnlinePlayer, "isOnline" | "positionForRouting">,
	unknown
> = {
	id: true,
	username: true,
	type: true,
	world: true,
	x: true,
	y: true,
	z: true,
}

export const search = (
	query: string | null | undefined,
	places: CompressedPlace[],
	players: Player[] | undefined,
) => {
	const coordinate = parseCoordinate(query)

	if (query?.startsWith("player-")) {
		const playerName = query.replace("player-", "")
		const player = players?.find(
			(p) => p.username.toLowerCase() === playerName.toLowerCase(),
		)
		if (player) return [{ obj: player }]
	}

	if (!query) return null
	const results = query
		? searcher.go(query, [...places.toReversed(), ...(players ?? [])], {
				keys: Object.keys({ ...keys, ...playerKeys }),
				limit: 30,
			})
		: null

	if (results && coordinate) return [{ obj: coordinate }, ...results]
	if (results) return results
	if (coordinate) return [{ obj: coordinate }]

	return null
}

export const findClosestPlace = (
	query: string | null | undefined,
	places: CompressedPlace[],
): CompressedPlace | Coordinate | undefined => {
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
