import type {
	ConnectionLine,
	DataType,
	Flight,
	Place,
	SpawnWarp,
} from "app/data"
import { getRouteTime } from "./getRouteTime"
import type { Coordinate } from "app/data/coordinates"
import { getDistance } from "app/utils/getDistance"

type Route = Flight | ConnectionLine | { type: "Walk"; distance: number }

/**
 * given two places, get all possible routes between them
 * note that this is a bit expensive, so we only do this after pathing
 */
export const getRouteOptions = (
	from: Place | Coordinate,
	to: Place | Coordinate,
	data: DataType,
) => {
	const { spawnWarps, flights, connectionLines } = data

	// todo excluded route modes
	const options: { time: number; route: Route | SpawnWarp }[] = []

	/* warps */
	const potentialWarp = spawnWarps.map.get(to.i)
	if (potentialWarp) {
		options.push({
			time: getRouteTime({ type: "SpawnWarp" }),
			route: potentialWarp,
		})
	}
	if (to.type === "Town" && to.name === "Central City") {
		options.push({
			time: getRouteTime({ type: "SpawnWarp" }),
			// this is only used for display - not routing
			route: {
				type: "SpawnWarp",
				pretty_id: "warp-spawn",
				i: "warp-spawn",
				name: "warp spawn",
				proximity: {},
				mode: "misc",
				world: "New",
				coordinates: [0, 0],
			} satisfies SpawnWarp,
		})
	}

	/* flights */
	if ("gates" in from && "gates" in to) {
		const fromGates = from.gates
		const toGates = to.gates

		const applicableFlights = flights.list
			.filter(
				// the flight must stop at both from and to
				(flight) =>
					flight.gates.some((gate) => fromGates.includes(gate)) &&
					flight.gates.some((gate) => toGates.includes(gate)),
			)
			.map((flight) => ({
				time: getRouteTime({ type: "AirFlight" }),
				route: flight,
			}))

		options.push(...applicableFlights)
	}

	/* other connections */
	if ("connections" in from) {
		const allConnections = from.connections[to.i]
			?.flatMap((c) => connectionLines.map.get(c.line))
			.filter((c) => c !== undefined)
			.map((c) => ({
				time: getRouteTime({ type: c?.type }),
				route: c,
			}))

		if (allConnections) options.push(...allConnections)
	}

	/* walking */
	const walkOption =
		"proximity" in from
			? from.proximity[to.i]
			: from.coordinates && to.coordinates
				? {
						distance: getDistance(
							from.coordinates[0],
							from.coordinates[1],
							to.coordinates[0],
							to.coordinates[1],
						),
					}
				: null

	if (walkOption?.distance)
		options.push({
			time: getRouteTime({ type: "Walk", distance: walkOption.distance }),
			route: { type: "Walk", distance: walkOption.distance },
		})

	return options.map((o) => o.route)
}
