"use server"

import type { RouteType } from "@prisma/client"

import { getEdgesAndPlaces } from "./getEdgesAndPlaces"
import { getPrettyEdge } from "./getPrettyEdge"
import { getRoutes } from "./getRoutes"
import { combineMRT } from "./postProcessing/combineMRT"
import { describeDiff, getResultDiff } from "./postProcessing/diff"
import removeExtras from "./postProcessing/removeExtra"

export const findPath = async (
	from: string,
	to: string,
	allowedModes: RouteType[],
) => {
	const { edges, places } = await getEdgesAndPlaces(allowedModes)

	const fromEdge = places.find((place) => place.id === from)
	const toEdge = places.find((place) => place.id === to)

	if (!fromEdge || !toEdge) throw new Error("Could not find from or to")

	console.log("finding path from", from, "to", to)
	try {
		const basicRoutes = removeExtras(
			getRoutes({
				edges,
				from: fromEdge,
				to: toEdge,
				preventReverse: false,
				places,
			}),
		)

		const allDiffs = getResultDiff(
			basicRoutes.map((route) => route.path.map((place) => place.id)),
		)

		// for each route, get the actual information
		const fullRoutePromises = basicRoutes.map((route, routeIndex) => ({
			cost: route.totalCost,
			path: route.path
				.map((thisPlace, placeIndex) => {
					const nextPlace = route.path[placeIndex + 1]

					return nextPlace ? getPrettyEdge(thisPlace.id, nextPlace.id) : null
				})
				.filter(Boolean),
			diff: describeDiff(allDiffs[routeIndex] ?? []),
		}))

		// unwrap the promises
		return await Promise.all(
			fullRoutePromises.map(async (route) => ({
				cost: route.cost,
				path: combineMRT(await Promise.all(route.path)),
				diff: await route.diff,
			})),
		)
	} finally {
		console.log("finished finding path from", from, "to", to)
	}
}
