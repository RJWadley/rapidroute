import type { CompressedPlace } from "app/utils/compressedPlaces"

export const getTextboxName = (
	place: Partial<CompressedPlace> | undefined | null,
) => {
	if (!place) return ""

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
