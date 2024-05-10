import { getCities } from "(temp)/data/useCities"
import type { MarkersResponse } from "(temp)/types/dynmapMarkers"
import dynamic from "next/dynamic"

const MapBase = dynamic(() => import("./MapBase").then((mod) => mod.default), {
	ssr: false,
})

export default async function Map() {
	const [initialMarkers, initialCities] = await Promise.all([
		fetch(
			"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
		).then((res) => res.json() as Promise<MarkersResponse>),
		getCities(),
	])

	return (
		<MapBase initialMarkers={initialMarkers} initialCities={initialCities} />
	)
}
