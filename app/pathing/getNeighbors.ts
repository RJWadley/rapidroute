import {
	connectionLines,
	type ExcludedRoutes,
	flights,
	gates,
	places,
} from "app/data"
import { getRouteTime } from "./getRouteTime"

/**
 * get all places that can be reached from a given location,
 * as well as the time it takes to get there
 */
export const getNeighbors = (
	locationId: string,
	excludeRoutes: ExcludedRoutes,
) => {
	const location = places.map.get(locationId)
	if (!location) return []

	/**
	 * walking neighbors
	 */
	const neighbors: {
		placeId: string
		time: number
	}[] = excludeRoutes.Walk
		? []
		: [
				...Object.entries(location.proximity).map(([id, proximity]) => ({
					placeId: id,
					time: getRouteTime({ type: "Walk", distance: proximity.distance }),
				})),
			]

	/**
	 * find neighbors via plane connections
	 */
	if ("gates" in location && !excludeRoutes.AirFlight) {
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
				placeId: airport.i,
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
						c.direction.direction !== locationId,
				),
			)
			.flatMap(([placeId, connections]) =>
				connections
					.map((c) => ({
						...c,
						line: connectionLines.map.get(c.line),
					}))
					.filter((c) => {
						// TODO - special handling for MRT lines (filter them separately)
						const line = c.line
						if (!line) return false

						if (
							"mode" in line &&
							line.mode &&
							excludeRoutes[`${line.mode}${line.type}` as keyof ExcludedRoutes]
						)
							return false

						return !excludeRoutes[line.type]
					})
					.map((c) => ({
						placeId,
						// TODO better factor in line type (MRT, boat, etc.) and station size (larger stations take longer to navigate, for e.g.)
						time: getRouteTime({
							type: c.line?.type,
						}),
					})),
			)

		neighbors.push(...reachedPlaces)
	}

	return neighbors
}
