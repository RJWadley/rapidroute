import type { Place } from "../data"

export const getRouteTime = (
	from: Place | undefined | null,
	to: Place | undefined | null,
) => {
	if (!from || !to) return Number.POSITIVE_INFINITY
	if (from === to)
		throw new Error("cannot get route time for the same location")
	if (from.type === "airport" && to.type === "airport") return 60 * 5
	return Number.POSITIVE_INFINITY
}
