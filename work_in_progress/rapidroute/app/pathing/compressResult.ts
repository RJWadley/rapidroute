import type { convertToRoutes } from "./convertToRoutes"

const identifyRoute = (
	route: { type: string; id: string } | { type: "walk" },
) => ("id" in route ? route.id : route.type)

/**
 * compress a result's path
 *
 * do this by combining legs that are the same route into a single leg
 * so if we have [a to b via 1, b to c via 1, c to d via 1 or 2, d to e via 2]
 * it would become [a to d via 1, d to e via 2]
 * (we want to stay on the same line as much as possible)
 *
 * any locations we cut out get added to a list of "skipped" locations for display purposes
 */
export function compressResult(result: ReturnType<typeof convertToRoutes>) {
	const mutablePath: ((typeof result.path)[number] | undefined)[] = [
		...result.path,
	]

	for (let i = 0; i < mutablePath.length; i++) {
		// pull the leg from the compressed path if it exists (so that we can chain squished legs together)
		const thisLeg = mutablePath[i]
		const nextLeg = mutablePath[i + 1]

		if (thisLeg && nextLeg) {
			const firstRoute = thisLeg.options.map((o) => identifyRoute(o))
			const secondRoute = nextLeg.options.map((o) => identifyRoute(o))
			const canSquish = firstRoute.some((routeId) =>
				secondRoute.includes(routeId),
			)

			if (canSquish) {
				const squishedLeg = {
					...thisLeg,
					to: nextLeg.to,
					// only keep options available in both legs
					options: thisLeg.options.filter((option) =>
						secondRoute.includes(identifyRoute(option)),
					),
					skipped: [...(thisLeg.skipped ?? []), nextLeg.from],
				}

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
