import { getDistance } from "app/utils/getDistance"
import type { convertToRoutes } from "./convertToRoutes"

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
				thisLeg.options.every((option) => option.type === "Walk") &&
				nextLeg.options.every((option) => option.type === "Walk")

			const fromCoordinates = thisLeg.from.coordinates
			const toCoordinates = nextLeg.to.coordinates

			if (canSquish && fromCoordinates && toCoordinates) {
				const squishedLeg = {
					...thisLeg,
					to: nextLeg.to,
					options: [
						{
							type: "Walk" as const,
							/**
							 * recalculate distance for proper deduplication
							 */
							distance:
								Math.round(
									getDistance(
										fromCoordinates[0],
										fromCoordinates[1],
										toCoordinates[0],
										toCoordinates[1],
									),
								) || 1,
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
