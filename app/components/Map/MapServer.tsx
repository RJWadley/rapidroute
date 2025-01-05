import type { CompressedPlace } from "app/utils/compressedPlaces"
import type { MarkersResponse } from "./Dynmap/dynmapType"
import MapClient from "./MapClient"

export default async function MinecraftMap({
	compressedPlaces,
}: { compressedPlaces: CompressedPlace[] }) {
	const [initialMarkers, initialCities] = await Promise.all([
		fetch(
			"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
		).then((res) => res.json() as Promise<MarkersResponse>),
		// getCities(),
		null,
	])

	return (
		<MapClient
			initialMarkers={initialMarkers}
			compressedPlaces={compressedPlaces}
		/>
	)
}
