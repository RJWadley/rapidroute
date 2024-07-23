import type { CompressedPlace } from "@/utils/compressedPlaces"

export const getTextboxName = (
	place: Partial<CompressedPlace> | undefined | null,
) => {
	if (!place) return ""

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
