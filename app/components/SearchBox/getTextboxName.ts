import type { Coordinate } from "app/data/coordinates"
import type { CompressedPlace } from "app/utils/compressedPlaces"

export const getTextboxName = (
	place: Partial<CompressedPlace> | Coordinate | undefined | null,
) => {
	if (!place) return ""

	if (place.type === "Coordinate")
		return `Coordinate ${place.coordinates[0]}, ${place.coordinates[1]}`

	if (place.type === "Town") return `${place.rank} City - ${place.name}`

	const code =
		"code" in place
			? place.code
			: "codes" in place
				? place.codes?.join(", ")
				: null
	const name = place.name

	if (code) return `${code} - ${name}`

	if (name) return name

	return "Untitled Location"
}
