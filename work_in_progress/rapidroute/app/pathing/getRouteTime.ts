import type { Place } from "../data"
import { getRouteOptions } from "./getRouteOptions"

const WALK_SPEED_MPS = 4

export const getRouteTime = (
	from: Place | undefined | null,
	to: Place | undefined | null,
) => {
	const infinity = Number.POSITIVE_INFINITY

	if (from === to)
		throw new Error("cannot get route time for the same location")
	if (!from || !to) return infinity

	const routes = getRouteOptions(from, to)

	const maximum = infinity

	/**
	 * flight time
	 */
	const flightTime = routes.some((route) => route.type === "flight")
		? 5 * 60
		: infinity

	/**
	 * warp rail travel time
	 */

	/**
	 * warp bus travel time
	 */

	/**
	 * ferry travel time
	 */

	/**
	 * walk travel time
	 */
	const walkDistance =
		{
			...from.proximity.airairport,
			...from.proximity.busstop,
			...from.proximity.railstation,
			...from.proximity.seastop,
			...from.proximity.town,
		}[to.id]?.distance ?? infinity
	const walkTime = walkDistance / WALK_SPEED_MPS

	return Math.min(maximum, flightTime, walkTime)
}
