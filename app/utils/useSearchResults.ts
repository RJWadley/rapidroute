import type { Coordinate } from "app/data/coordinates"
import { useCallback, useMemo, useState } from "react"
import type { CompressedPlace } from "./compressedPlaces"
import {
	type OfflinePlayer,
	parseOfflinePlayers,
	useOfflinePlayers,
} from "./offlinePlayers"
import { type OnlinePlayer, useOnlinePlayers } from "./onlinePlayers"
import { search } from "./search"

export const useSearchResults = <T extends Partial<CompressedPlace>>(
	places: T[],
): {
	results: (T | Coordinate | OnlinePlayer | OfflinePlayer)[]
	runSearch: (query: string) => void
} => {
	const [results, setResults] = useState<ReturnType<typeof search<T>>>()

	const { data: onlinePlayers } = useOnlinePlayers()
	const { data: offlinePlayers } = useOfflinePlayers()

	const runSearch = useCallback(
		(query: string) => {
			const players = [
				...Object.values(onlinePlayers ?? {}),
				...Object.values(parseOfflinePlayers(offlinePlayers) ?? {}).filter(
					(x) => (onlinePlayers ? !(x.id in onlinePlayers) : true),
				),
			]

			const newResults = query ? search(query, places, players) : null

			setResults(newResults)
		},
		[offlinePlayers, onlinePlayers, places],
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
