import type { CompressedPlace } from "app/utils/compressedPlaces"
import CityMarker from "./CityMarker"
import { useSuspenseQuery } from "@tanstack/react-query"

export default function Cities() {
	const { data: places } = useSuspenseQuery<CompressedPlace[]>({
		queryKey: ["compressed-places"],
	})

	return places.map((place) =>
		place.type === "Town" && place.coordinates ? (
			<CityMarker
				id={place.id}
				key={place.id}
				name={place.name}
				x={place.coordinates[0]}
				z={place.coordinates[1]}
				type={
					place.name === "Central City" ? "spawn" : (place.rank ?? "Unranked")
				}
			/>
		) : null,
	)
}
