import { flights, gates, places } from "../data"
import { getRouteTime } from "./getRouteTime"

export const getNeighbors = (
	locationId: string,
): { placeId: string; time: number }[] => {
	const location = places.map.get(locationId)
	if (!location) return []

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
				time: getRouteTime(airport, location),
			}))

		return allReachedAirports
	}

	return []
}
