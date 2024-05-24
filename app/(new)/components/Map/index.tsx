import { getCities } from "temp/data/useCities"
import type { MarkersResponse } from "temp/types/dynmapMarkers"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import BackgroundIMG from "./Placeholder.png"
import { styled } from "next-yak"
import UniversalImage from "temp/utils/UniversalImage"

const MapBase = dynamic(() => import("./MapBase").then((mod) => mod.default), {
	ssr: false,
})

export default async function MinecraftMap() {
	const [initialMarkers, initialCities] = await Promise.all([
		fetch(
			"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
		).then((res) => res.json() as Promise<MarkersResponse>),
		getCities(),
	])

	return (
		<>
			<MapWrapper>
				<Background src={BackgroundIMG} alt="" priority />
				<Suspense fallback={null}>
					<MapBase
						initialMarkers={initialMarkers}
						initialCities={initialCities}
					/>
				</Suspense>
			</MapWrapper>
		</>
	)
}

const Background = styled(UniversalImage)`
	width: auto;
	height: 1920px;
	object-fit: cover;
	max-width: unset;
	max-height: unset;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	filter: blur(10px);
	border-radius: 100px;
	pointer-events: none;
`

const MapWrapper = styled.div`
	overflow: clip;
	position: relative;
	width: 400px;
	height: 400px;
`
