import type { MarkersResponse } from "~/types/dynmapMarkers";
import type { BarePlace } from "./temporaryDatabase";

export default async function getDynmapAirports() {
	const markers = await fetch(
		"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
	)
		.then((res) => res.json())
		.then((data) => data as MarkersResponse);

	return Object.entries(markers.sets.airports.markers).map(
		([key, { label, x, z }]) => {
			return {
				IATA: key.toUpperCase().trim(),
				id: key.toUpperCase().trim(),

				name: label,
				type: "Airport",
				worldName: "New",
				coordinate_x: x,
				coordinate_z: z,
			} satisfies BarePlace;
		},
	);
}
