import type { RoutingResult } from "."
import { companies, gates } from "../data"
import { getRouteOptions } from "./getRouteOptions"

export const convertToRoutes = (result: RoutingResult) => {
	const allLocationPairs = result.path
		.map((_, index) => {
			const first = result.path[index]
			const second = result.path[index + 1]
			return first && second ? ([first, second] as const) : null
		})
		.filter((x) => x !== null)

	const routes = allLocationPairs.map(([from, to]) => ({
		id: Math.random(),
		from,
		to,
		options: getRouteOptions(from, to).map((options) => ({
			...options,
			gates: options.gates
				.map((gate) => gates.map.get(gate))
				.filter((x) => x !== undefined),
			airline: companies.map.get(options.airline),
		})),
	}))

	return {
		time: result.time,
		path: routes,
	}
}
