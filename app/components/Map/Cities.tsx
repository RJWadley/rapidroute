import type { CompressedPlace } from "app/utils/compressedPlaces"
import CityMarker from "./CityMarker"

export default function Cities({
	places,
}: {
	places: CompressedPlace[]
}) {
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
