import { useDeferredValue, useMemo } from "react"
import type { CompressedPlace } from "./compressedPlaces"
import { search } from "./search"

export const useSearchResults = <T extends Partial<CompressedPlace>>(
	rawQuery: string | undefined | null,
	initialPlaces: T[],
): T[] => {
	const query = useDeferredValue(rawQuery)

	const results = useMemo(
		() => (query ? search(query, initialPlaces) : null),
		[query, initialPlaces],
	)

	return results ? results.map((r) => r.obj) : initialPlaces
}
