import { flights, gates, places } from "../data"

const WALKING_SPEED_METERS_PER_SECOND = 4

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
			time: proximity.distance / WALKING_SPEED_METERS_PER_SECOND,
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
			.flatMap((flight) => flight.gates)
			.map((gateId) => gates.map.get(gateId))
			.filter((gate) => gate !== undefined)
			.map((gate) => places.map.get(gate?.airport))
			.filter((airport) => airport !== undefined)
			.filter((airport) => airport !== location)
			.map((airport) => ({
				placeId: airport.id,
				type: "flight",
				time: 60 * 5,
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
			.map(([placeId]) => ({
				placeId,
				time: 60 * 5,
			}))

		neighbors.push(...reachedPlaces)
	}

	return neighbors
}
