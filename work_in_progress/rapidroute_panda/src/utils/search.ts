import type { Place } from "@prisma/client"
import searcher from "fuzzysort"
import { useDeferredValue, useMemo } from "react"

/**
 * given an array, get n random elements from it
 */
const getRandom = <T>(arr: T[], n: number) => {
	const shuffled = [...arr]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		// @ts-expect-error swap elements
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled.slice(0, n)
}

export const useSearchResults = <T extends Partial<Place>>(
	rawQuery: string | undefined | null,
	initialPlaces: T[],
) => {
	const query = useDeferredValue(rawQuery)

	const results = useMemo(
		() =>
			query
				? searcher.go(query, initialPlaces.toReversed(), {
						keys: ["name", "IATA", "type", "worldName"],
						limit: 30,
					})
				: null,
		[query, initialPlaces],
	)

	return results ? results.map((r) => r.obj) : getRandom(initialPlaces, 10)
}
