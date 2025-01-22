import type { Coordinate } from "app/data/coordinates"
import { useCallback, useMemo, useState } from "react"
import type { CompressedPlace } from "./compressedPlaces"
import { type OnlinePlayer, useOnlinePlayers } from "./onlinePlayers"
import { search } from "./search"

export const useSearchResults = <T extends Partial<CompressedPlace>>(
	places: T[],
): {
	results: (T | Coordinate | OnlinePlayer)[]
	runSearch: (query: string) => void
} => {
	const [results, setResults] = useState<ReturnType<typeof search<T>>>()

	const { data: players } = useOnlinePlayers()

	const runSearch = useCallback(
		(query: string) => {
			const newResults = query
				? search(query, places, Object.values(players ?? {}))
				: null

			setResults(newResults)
		},
		[places, players],
	)

	const randomPlaces = useMemo(() => {
		const shuffled = [...places].sort(() => Math.random() - 0.5)
		return shuffled.slice(0, 10)
	}, [places])

	return {
		results: results ? results.map((r) => r.obj) : randomPlaces,
		runSearch,
	}
}
