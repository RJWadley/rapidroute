import { flights, type Place } from "../data"

export const getRouteOptions = (from: Place, to: Place) => {
	if ("gates" in from && "gates" in to) {
		const fromGates = from.gates
		const toGates = to.gates

		const applicableFlights = flights.list.filter(
			// the flight must stop at both from and to
			(flight) =>
				flight.gates.some((gate) => fromGates.includes(gate)) &&
				flight.gates.some((gate) => toGates.includes(gate)),
		)

		return applicableFlights
	}

	return []
}
