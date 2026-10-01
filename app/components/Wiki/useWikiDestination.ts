import { useSuspenseQuery } from "@tanstack/react-query"
import type { WikiContext } from "app/api/getWikiContent/input"
import { useTRPC } from "app/api/trpc/client"
import { useRouting } from "app/providers/RoutingContext"
import { findClosestPlace } from "app/utils/search"

export default function useWikiDestination() {
	const { toID: placeID } = useRouting()
	const trpc = useTRPC()
	const { data: compressedPlaces } = useSuspenseQuery(
		trpc.compressedPlaces.queryOptions(),
	)
	const place = findClosestPlace(placeID, compressedPlaces)
	const name =
		place?.type === "Coordinate" || placeID?.startsWith("player-")
			? null
			: place?.name || place?.id || placeID
	if (!name) return null
	const context: WikiContext =
		place && place.type !== "Coordinate"
			? {
					id: place.id,
					type: place.type,
					codes: place.codes,
					company: place.company?.name,
					world: place.world,
					coordinates: place.coordinates,
					mayor: place.mayor,
				}
			: undefined
	return { name, context }
}
