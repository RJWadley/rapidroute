import type { RoutingResult } from "."
import type { DataType, Place } from "app/data"
import { getRouteOptions } from "./getRouteOptions"
import type { Coordinate } from "app/data/coordinates"

/**
 * takes a list of places (what the pather returns) and converts it
 * into a list of routes between those locations (the info the user wants)
 *
 * @see {getRouteOptions}
 */
export const convertToRoutes = (result: RoutingResult, data: DataType) => {
	const { gates, companies } = data

	const allLocationPairs = result.path
		.map((_, index) => {
			const first = result.path[index]
			const second = result.path[index + 1]
			return first && second ? ([first, second] as const) : null
		})
		.filter((x) => x !== null)

	const routes = allLocationPairs.map(([from, to]) => ({
		from,
		to,
		skipped: undefined as (Place | Coordinate)[] | undefined,
		options: getRouteOptions(from, to, data).map((option) => ({
			...option,
			gates:
				"gates" in option
					? option.gates
							.map((gate) => gates.map.get(gate))
							.filter((x) => x !== undefined)
					: undefined,
			airline:
				"airline" in option ? companies.map.get(option.airline) : undefined,
			company:
				"company" in option ? companies.map.get(option.company) : undefined,
		})),
	}))

	return {
		...result,
		path: routes,
	}
}
