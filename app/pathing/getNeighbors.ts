import type { DataType, ExcludedRoutes, Place } from "app/data"
import { placesMatch } from "app/data/placesMatch"
import { getRouteTime } from "./getRouteTime"
import type { Coordinate } from "app/data/coordinates"
import { getClosestPlaces } from "./getClosestPlaces"
import { getDistance } from "app/utils/getDistance"

/**
 * get all places that can be reached from a given location,
 * as well as the time it takes to get there
 */
export const getNeighbors = ({
	startPlace,
	endPlace,
	data,
	excludedRoutes,
	fromPlace,
}: {
	fromPlace: Place | Coordinate
	excludedRoutes: ExcludedRoutes
	data: DataType
	startPlace: Place | Coordinate
	endPlace: Place | Coordinate
}) => {
	const { places, spawn, spawnWarps, gates, flights, connectionLines } = data

	type Neighbor = { place: Place | Coordinate; time: number }
	const neighbors: Neighbor[] = []

	/**
	 * spawn warps
	 */
	if (!excludedRoutes.SpawnWarp.misc)
		neighbors.push({
			place: spawn,
			time: getRouteTime({ type: "SpawnWarp" }),
		})
	neighbors.push(
		...spawnWarps.list
			.filter((warp) => !excludedRoutes.SpawnWarp[warp.mode])
			.map((warp) => ({
				place: warp,
				time: getRouteTime({ type: "SpawnWarp" }),
			})),
	)

	/**
	 * walking neighbors
	 */
	if (
		!placesMatch(startPlace, fromPlace) ||
		// start filter
		(placesMatch(startPlace, fromPlace) && !excludedRoutes.Walk.atRouteStart)
	) {
		const coordinateFromDestinations: Neighbor[] =
			startPlace?.type === "Coordinate" && placesMatch(startPlace, fromPlace)
				? getClosestPlaces(startPlace.coordinates, data).map(
						({ place, distance }) => ({
							place,
							time: getRouteTime({
								type: "Walk",
								distance: distance,
							}),
						}),
					)
				: []

		const coordinateToDestination =
			endPlace?.type === "Coordinate" && fromPlace.coordinates
				? [
						{
							place: endPlace,
							time: getRouteTime({
								type: "Walk",
								distance:
									getDistance(
										fromPlace.coordinates[0],
										fromPlace.coordinates[1],
										endPlace.coordinates[0],
										endPlace.coordinates[1],
									) || 1,
							}),
						} satisfies Neighbor,
					]
				: []

		const walkTo: Neighbor[] = [
			...Object.entries(
				"proximity" in fromPlace ? fromPlace.proximity : {},
			).flatMap(([id, proximity]) => {
				const toPlace = places.map.get(id)
				return proximity.distance && toPlace
					? [
							{
								place: toPlace,
								time: getRouteTime({
									type: "Walk",
									distance: proximity.distance,
								}),
							} satisfies Neighbor,
						]
					: []
			}),
			...coordinateToDestination,
			...coordinateFromDestinations,
		]

		neighbors.push(
			...walkTo
				// end filter
				.flatMap((result) =>
					placesMatch(result.place, endPlace) && excludedRoutes.Walk.atRouteEnd
						? []
						: [result],
				)
				// middle filter
				.flatMap((result) =>
					!placesMatch(fromPlace, startPlace) &&
					!placesMatch(result.place, endPlace) &&
					excludedRoutes.Walk.middle
						? []
						: [result],
				),
		)
	}

	/**
	 * find neighbors via plane connections
	 */
	if (fromPlace.type === "AirAirport") {
		const allGatesHere = fromPlace.gates.map((gateId) => gates.map.get(gateId))
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
			.filter((airport) => airport !== fromPlace)
			.map((airport) => ({
				place: airport,
				// TODO factor in gate existance & airport size (not in this file though)
				time: getRouteTime({ type: "AirFlight" }),
			}))

		neighbors.push(...allReachedAirports)
	}

	/**
	 * find neighbors via rail/sea/bus connections
	 */
	if ("connections" in fromPlace) {
		const reachedPlaces = Object.entries(fromPlace.connections)
			.filter(([, connection]) =>
				connection.some(
					(c) =>
						// the route must be either
						// bidirectional
						c.direction.one_way === false ||
						// or one-way, away from the current location
						c.direction.direction !== fromPlace.i,
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
						place: places.map.get(placeId),
						// TODO better factor in line type (MRT, boat, etc.) and station size (larger stations take longer to navigate, for e.g.) (not in this file though)
						time: getRouteTime({
							type: c.line?.type,
						}),
					}))
					.flatMap(({ place, time }) => (place ? { place, time } : [])),
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
