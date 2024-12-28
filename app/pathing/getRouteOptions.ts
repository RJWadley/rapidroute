import type {
	ConnectionLine,
	DataType,
	Flight,
	Place,
	SpawnWarp,
} from "app/data"
import { getRouteTime } from "./getRouteTime"

type Route =
	| Flight
	| ConnectionLine
	| SpawnWarp
	| { type: "Walk"; distance: number }

/**
 * given two places, get all possible routes between them
 * note that this is a bit expensive, so we only do this after pathing
 */
export const getRouteOptions = (from: Place, to: Place, data: DataType) => {
	const { spawnWarps, flights, connectionLines } = data

	// todo excluded route modes
	const options: { time: number; route: Route }[] = []

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
	const walkOption = from.proximity[to.i]

	if (walkOption?.distance)
		options.push({
			time: getRouteTime({ type: "Walk", distance: walkOption.distance }),
			route: { type: "Walk", distance: walkOption.distance },
		})

	const fastestTime = Math.min(
		...options
			.filter(
				// don't let walks be the fastest option to avoid excessive filtering
				(o) => o.route.type !== "Walk",
			)
			.map((o) => o.time),
	)

	// only keep options within 60s of the fastest time (to avoid showing stupid options)
	return options.filter((o) => o.time <= fastestTime + 60).map((o) => o.route)
}
