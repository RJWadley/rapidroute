import {
	connectionLines,
	type ExcludedRoutes,
	flights,
	gates,
	places,
	spawnWarps,
} from "app/data"
import { getRouteTime } from "./getRouteTime"

const spawn = places.list
	.filter((x) => x.type === "Town")
	.find((x) => x.name === "Central City")
if (!spawn) throw new Error("could not find central city")

/**
 * get all places that can be reached from a given location,
 * as well as the time it takes to get there
 */
export const getNeighbors = (
	locationId: string,
	excludedRoutes: ExcludedRoutes,
) => {
	const location = places.map.get(locationId)
	if (!location) return []

	console.log(excludedRoutes)

	const neighbors: {
		placeId: string
		time: number
	}[] = []

	/**
	 * spawn warps
	 */
	if (!excludedRoutes.SpawnWarp.misc)
		neighbors.push({
			placeId: spawn.i,
			time: getRouteTime({ type: "SpawnWarp" }),
		})
	neighbors.push(
		...spawnWarps.list
			.filter((warp) => !excludedRoutes.SpawnWarp[warp.mode])
			.map((warp) => ({
				placeId: warp.i,
				time: getRouteTime({ type: "SpawnWarp" }),
			})),
	)

	/**
	 * walking neighbors
	 */
	if (!excludedRoutes.Walk.unk) {
		neighbors.push(
			...Object.entries(location.proximity).flatMap(([id, proximity]) =>
				proximity.distance
					? [
							{
								placeId: id,
								time: getRouteTime({
									type: "Walk",
									distance: proximity.distance,
								}),
							},
						]
					: [],
			),
		)
	}

	/**
	 * find neighbors via plane connections
	 */
	if (location.type === "AirAirport") {
		const allGatesHere = location.gates.map((gateId) => gates.map.get(gateId))
		const allFlights = allGatesHere
			.flatMap((gate) =>
				gate?.flights.map((flightId) => flights.map.get(flightId)),
			)
			.filter((flight) => flight !== undefined)
			.filter((flight) => !excludedRoutes.AirFlight[flight.mode])

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
				// TODO factor in gate existance & airport size (not in this file though)
				time: getRouteTime({ type: "AirFlight" }),
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

						if (line.type === "BusLine" && excludedRoutes.BusLine.unk)
							return false
						if (
							line.type !== "BusLine" &&
							excludedRoutes[line.type][line.mode as "unk"]
						)
							return false

						return true
					})
					.map((c) => ({
						placeId,
						// TODO better factor in line type (MRT, boat, etc.) and station size (larger stations take longer to navigate, for e.g.) (not in this file though)
						time: getRouteTime({
							type: c.line?.type,
						}),
					})),
			)

		neighbors.push(...reachedPlaces)
	}

	// assert that we don't return any zero-time neighbors
	for (const neighbor of neighbors) {
		if (neighbor.time === 0) {
			throw new Error("generated neighbor has zero time! this is a bug.")
		}
	}

	return neighbors
}
