import type { MarkersResponse } from "./Dynmap/dynmapType"
import MapClient from "./MapClient"
import { getMapPreview } from "./preview"

export default async function MinecraftMap() {
	const [initialMarkers, initialCities, previewImage] = await Promise.all([
		fetch(
			"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
		).then((res) => res.json() as Promise<MarkersResponse>),
		// getCities(),
		null,
		getMapPreview(),
	])

	return (
		<MapClient initialMarkers={initialMarkers} previewImage={previewImage} />
	)
}
