import type { MarkerSet } from "~/types/dynmapMarkers"
import type { BarePlace } from "../temporaryDatabase"

export const getStations = (set: MarkerSet) => {
	return Object.entries(set.markers).map(([key, { label, x, z }]) => {
		let currentId = key.toUpperCase()

		// fix id mistakes
		if (currentId === "WN34 STATION") currentId = "WN34"
		if (currentId === "MS") currentId = "MH"
		if (currentId === "M0") currentId = "MW"
		if (currentId === "WH24") currentId = "WN24"

		return {
			id: currentId.trim(),
			name: label,
			placeCode: currentId.trim(),
			type: "MrtStation",
			worldName: "New",
			coordinate_x: x,
			coordinate_z: z,
		} satisfies BarePlace
	})
}
