import type { Player } from "app/api/players/type"
import type { Place } from "app/data"
import type { Coordinate } from "app/data/coordinates"
import type { CompressedPlace } from "app/utils/compressedPlaces"

export const getDistinctCodes = (place: CompressedPlace): string[] => {
	if (place.nameIsCode) return []
	const name = place.name.trim().toLowerCase()
	if (place.codes?.join(", ").trim().toLowerCase() === name) return []
	return place.codes?.filter((code) => code.trim().toLowerCase() !== name) ?? []
}

export const getTextboxName = (
	place: CompressedPlace | Coordinate | Player | undefined,
): string => {
	if (!place) return "Some Place"

	if (place.type === "Player")
		return place.isOnline
			? `${place.username} (player at ${place.x}, ${place.z})`
			: place.username

	if (place.type === "Coordinate")
		return `Coordinate ${place.coordinates[0]}, ${place.coordinates[1]}`

	if (place.type === "Town") return `${place.rank} City - ${place.name}`

	const code = getDistinctCodes(place).join(", ")
	const name = place.name

	if (code) return `${code} - ${name}`

	if (name) return name

	return "Untitled Location"
}

export const getShortName = (
	item: Place | Player | Coordinate | undefined,
): string => {
	if (!item) return "Place"

	switch (item.type) {
		case "Player":
			return item.username
		case "Coordinate":
			return `${item.coordinates[0]}, ${item.coordinates[1]}`
		case "AirAirport":
			return item.code
		case "RailStation":
			return item.codes?.length
				? `${item.codes.join(", ")}`
				: item.name || "Rail Station"
		case "Town":
			return item.name || "Town"
		case "BusStop":
			return item.name || "Bus Stop"
		case "SeaStop":
			return item.name || "Sea Stop"
		default:
			return "RAPIDROUTE HAS A BUG! YOU FOUND A BUG! AAAAAAAA"
	}
}

export const getLongName = (
	item: CompressedPlace | Coordinate | Player | undefined,
): string => {
	if (!item) return "Some Place"

	switch (item.type) {
		case "Player":
			return item.username
		case "Coordinate":
			return `${item.coordinates[0]}, ${item.coordinates[1]}`
		case "AirAirport":
			return item.codes?.length
				? `${item.codes.join(", ")}`
				: item.name || "Airport"
		case "RailStation":
			return item.codes?.length
				? `${item.codes.join(", ")}`
				: item.name || "Rail Station"
		case "Town":
			return item.name || "Town"
		case "BusStop":
			return item.name || "Bus Stop"
		case "SeaStop":
			return item.name || "Sea Stop"
		default:
			return "RAPIDROUTE HAS A BUG! YOU FOUND A BUG! AAAAAAAA"
	}
}
