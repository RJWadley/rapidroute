import { connectionLines, flights, type Place } from "../data"

type Route =
	| (typeof flights.list)[number]
	| (typeof connectionLines.list)[number]
	| { type: "walk"; distance: number }

export const getRouteOptions = (from: Place, to: Place) => {
	const options: Route[] = []

	/* flights */
	if ("gates" in from && "gates" in to) {
		const fromGates = from.gates
		const toGates = to.gates

		const applicableFlights = flights.list.filter(
			// the flight must stop at both from and to
			(flight) =>
				flight.gates.some((gate) => fromGates.includes(gate)) &&
				flight.gates.some((gate) => toGates.includes(gate)),
		)

		options.push(...applicableFlights)
	}

	/* other connections */
	if ("connections" in from) {
		const allConnections = from.connections[to.id]
			?.flatMap((c) => connectionLines.map.get(c.line))
			.filter((c) => c !== undefined)

		if (allConnections) options.push(...allConnections)
	}

	/* walking */
	const walkOption = {
		...from.proximity.airairport,
		...from.proximity.busstop,
		...from.proximity.railstation,
		...from.proximity.seastop,
		...from.proximity.town,
	}[to.id]

	if (walkOption) options.push({ ...walkOption, type: "walk" })

	return options
}
