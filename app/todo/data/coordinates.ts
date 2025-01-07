export type Coordinate = {
	type: "Coordinate"
	i: `x${number}z${number}`
	id: `x${number}z${number}`
	coordinates: [number, number]
	world: "New"
}

/**
 * allowed seperators are commas, periods, and underscores
 */
const coordinateRegex = /^x(-?\d+)z(-?\d+)$/g

const cache = new Map<string, Coordinate | null>()

export const parseCoordinateId = (coordinates: string): Coordinate | null => {
	const cached = cache.get(coordinates.trim())
	if (cached) return cached

	const match = coordinates.trim().matchAll(coordinateRegex).next().value
	if (!match) return null

	const [, xString, zString] = match
	if (!xString || !zString) return null

	const x = Number.parseFloat(xString)
	const z = Number.parseFloat(zString)
	if (Number.isNaN(x) || Number.isNaN(z)) return null

	const out: Coordinate = {
		type: "Coordinate",
		i: `x${x}z${z}`,
		id: `x${x}z${z}`,
		coordinates: [x, z],
		world: "New",
	}
	cache.set(coordinates.trim(), out)
	return out
}

const extractionPreference = [
	// non-compact with separator support
	/(-?[\d,. _]+)[,._]?\s+(-?[\d,. _]+)/g,
	// compact, single separator allowed
	/(-?\d+)[,. _]+(-?\d+)/g,
]

export const parseCoordinate = (
	query: string | null | undefined,
): Coordinate | null => {
	if (!query) return null
	const parseAsId = parseCoordinateId(query.trim())
	if (parseAsId) return parseAsId

	return (
		extractionPreference
			.flatMap((regex) =>
				[...query.matchAll(regex)].map((match) => {
					const [, xString, zString] = match
					if (!xString || !zString) return null

					const x = Number.parseInt(xString.replaceAll(/[_,. ]/g, ""))
					const z = Number.parseInt(zString.replaceAll(/[_,. ]/g, ""))
					if (Number.isNaN(x) || Number.isNaN(z)) return null

					return {
						type: "Coordinate",
						i: `x${x}z${z}`,
						id: `x${x}z${z}`,
						coordinates: [x, z],
						world: "New",
					} satisfies Coordinate
				}),
			)
			.find((x) => x !== null) ?? null
	)
}
