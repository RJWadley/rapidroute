import { MapClient } from "./Client"
import { parseMarkersWithFallback } from "./markers-schema"

export async function MapServer() {
	const markersResponse = await fetch(
		"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
		{ cache: "force-cache" },
	)
		.then((r) => r.json())
		.catch(() => null)

	const markers = parseMarkersWithFallback(markersResponse)

	return <MapClient markers={markers} />
}
