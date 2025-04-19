import type { CompressedPlace } from "app/utils/compressedPlaces"
import CityMarker from "./CityMarker"
import { useSuspenseQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "trpc/client"

export default function Cities() {
	const trpc = useTRPC()
	const { data: places } = useSuspenseQuery(
		trpc.compressedPlaces.queryOptions(),
	)

	return places.map((place) =>
		place.type === "Town" && place.coordinates ? (
			<CityMarker
				id={place.id}
				key={place.id}
				name={place.name}
				x={place.coordinates[0]}
				y={60}
				z={place.coordinates[1]}
				type={
					place.name === "Central City" ? "spawn" : (place.rank ?? "Unranked")
				}
			/>
		) : null,
	)
}
