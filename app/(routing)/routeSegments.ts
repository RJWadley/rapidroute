import { parseCoordinateId } from "app/data/coordinates"

/** Only real destinations and the app's supported URL shapes get page entries. */
export function isRoutingPath(
	encodedSegments: readonly string[] | undefined,
	placeIds: ReadonlySet<string>,
) {
	// Next supplies encoded params, just like the client RoutingProvider expects.
	let segments: string[] | undefined
	try {
		segments = encodedSegments?.map((segment) => decodeURIComponent(segment))
	} catch {
		return false
	}

	const isDestination = (id: string | undefined) => {
		if (!id) return false
		if (placeIds.has(id) || /^player-[^/]+$/.test(id)) return true
		const coordinate = parseCoordinateId(id)
		return !!coordinate?.coordinates.every(Number.isFinite)
	}

	if (!segments?.length) return true
	if (segments[0] === "place")
		return segments.length === 2 && isDestination(segments[1])
	if (segments[0] !== "navigate" || segments[1] !== "from") return false
	if (!isDestination(segments[2])) return false
	return (
		segments.length === 3 ||
		(segments.length === 5 &&
			segments[3] === "to" &&
			isDestination(segments[4]))
	)
}
