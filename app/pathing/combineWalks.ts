import type { convertToRoutes } from "./convertToRoutes"

export function combineWalks(
	result: Awaited<ReturnType<typeof convertToRoutes>>,
) {
	const mutablePath: ((typeof result.path)[number] | undefined)[] = [
		...result.path,
	]

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

			if (canSquish) {
				const squishedLeg = {
					...thisLeg,
					to: nextLeg.to,
					// only keep options available in both legs
					options: thisLeg.options,
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
