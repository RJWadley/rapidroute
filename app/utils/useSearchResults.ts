import type { Coordinate } from "app/data/coordinates"
import { useCallback, useMemo, useState } from "react"
import type { CompressedPlace } from "./compressedPlaces"
import { search } from "./search"
import type { Player } from "app/api/players/type"
import { useOnlinePlayers } from "app/api/players/client"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "app/api/trpc/client"

export const useSearchResults = (
	places: CompressedPlace[],
): {
	results: (CompressedPlace | Coordinate | Player)[]
	runSearch: (query: string) => void
} => {
	const [results, setResults] = useState<ReturnType<typeof search>>()

	const trpc = useTRPC()
	const { data: onlinePlayers } = useOnlinePlayers()
	const { data: offlinePlayers } = useQuery(trpc.offlinePlayers.queryOptions())

	const runSearch = useCallback(
		(query: string) => {
			const players = [
				...Object.values(onlinePlayers ?? {}),
				...Object.values(offlinePlayers ?? {}).filter((x) =>
					onlinePlayers ? !(x.id in onlinePlayers) : true,
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
