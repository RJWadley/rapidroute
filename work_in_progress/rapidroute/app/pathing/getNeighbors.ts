import { connectionLines, flights, gates, places } from "../data"
import { getRouteTime } from "./getRouteTime"

/**
 * get all places that can be reached from a given location,
 * as well as the time it takes to get there
 */
export const getNeighbors = (locationId: string) => {
	const location = places.map.get(locationId)
	if (!location) return []

	/**
	 * walking neighbors
	 */
	const neighbors: { placeId: string; time: number }[] = [
		...Object.entries({
			...location.proximity.airairport,
			...location.proximity.railstation,
			...location.proximity.seastop,
			...location.proximity.busstop,
			...location.proximity.town,
		}).map(([id, proximity]) => ({
			placeId: id,
			time: getRouteTime({ type: "walk", distance: proximity.distance }),
		})),
	]

	/**
	 * find neighbors via plane connections
	 */
	if ("gates" in location) {
		const allGatesHere = location.gates.map((gateId) => gates.map.get(gateId))
		const allFlights = allGatesHere
			.flatMap((gate) =>
				gate?.flights.map((flightId) => flights.map.get(flightId)),
			)
			.filter((flight) => flight !== undefined)

		const allReachedAirports = allFlights
			// get all gates at this airport
			.flatMap((flight) => flight.gates)
			.map((gateId) => gates.map.get(gateId))
			.filter((gate) => gate !== undefined)
			// get all airports reachable from those gates
			.map((gate) => places.map.get(gate?.airport))
			.filter((airport) => airport !== undefined)
			// remove the current location
			.filter((airport) => airport !== location)
			.map((airport) => ({
				placeId: airport.id,
				type: "flight",
				// TODO factor in gate existance & airport size
				time: getRouteTime({ type: "flight" }),
			}))

		neighbors.push(...allReachedAirports)
	}

	/**
	 * find neighbors via rail/sea/bus connections
	 */
	if ("connections" in location) {
		const reachedPlaces = Object.entries(location.connections)
			.filter(([, connection]) =>
				connection.some(
					(c) =>
						// the route must be either
						// bidirectional
						c.direction.one_way === false ||
						// or one-way, away from the current location
						c.direction.forward_towards_code !== locationId,
				),
			)
			.flatMap(([placeId, connections]) =>
				connections.map((c) => ({
					placeId,
					// TODO better factor in line type (MRT, boat, etc.) and station size (larger stations take longer to navigate, for e.g.)
					time: getRouteTime({
						type: connectionLines.map.get(c.line)?.type,
					}),
				})),
			)

		neighbors.push(...reachedPlaces)
	}

	return neighbors
}
