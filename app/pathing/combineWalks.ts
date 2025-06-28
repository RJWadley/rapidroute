import { getDistance } from "app/utils/getDistance"
import type { convertToRoutes } from "./convertToRoutes"
import { getRouteTime } from "./getRouteTime"

export function combineWalks(
	result: Awaited<ReturnType<typeof convertToRoutes>>,
): ReturnType<typeof convertToRoutes> {
	const mutablePath = [...result.path, undefined]

	// iterate through the path and squish legs together one by one
	for (let i = 0; i < mutablePath.length; i++) {
		// pull the leg from the compressed path if it exists (so that we can chain squished legs together)
		const thisLeg = mutablePath[i]
		const nextLeg = mutablePath[i + 1]

		if (thisLeg && nextLeg) {
			// if we can stay on the same route, let's get squishy!
			const canSquish =
				thisLeg.options.every((option) => option.route.type === "Walk") &&
				nextLeg.options.every((option) => option.route.type === "Walk")

			const fromCoordinates = thisLeg.from.coordinates
			const toCoordinates = nextLeg.to.coordinates

			if (canSquish && fromCoordinates && toCoordinates) {
				const walkDistance =
					Math.round(
						getDistance(
							fromCoordinates[0],
							fromCoordinates[1],
							toCoordinates[0],
							toCoordinates[1],
						),
					) || 1
				const walkRoute = {
					type: "Walk" as const,
					distance: walkDistance,
				}
				const squishedLeg = {
					...thisLeg,
					to: nextLeg.to,
					options: [
						{
							route: walkRoute,
							time: getRouteTime(walkRoute),
							// Add these to match the structure from convertToRoutes
							gates: undefined,
							airline: undefined,
							company: undefined,
						},
					],
					// don't include skipped locations for walks
				}

				// to keep indexes in sync, set to undefined instead of removing
				// we'll filter them out at the end
				mutablePath[i] = undefined
				mutablePath[i + 1] = squishedLeg
			}
		}
	}

	return {
		...result,
		path: mutablePath.filter((x) => x !== undefined),
	}
}
