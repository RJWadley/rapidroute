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
		options: getRouteOptions(from, to).map((option) => ({
			...option,
			gates:
				"gates" in option
					? option.gates
							.map((gate) => gates.map.get(gate))
							.filter((x) => x !== undefined)
					: null,
			airline: "airline" in option ? companies.map.get(option.airline) : null,
			company: "company" in option ? companies.map.get(option.company) : null,
		})),
	}))

	return {
		time: result.time,
		path: routes,
	}
}
