"use client"
import { Stage } from "@pixi/react"
import { QueryClientProvider } from "@tanstack/react-query"
import gsap from "gsap"
import { styled } from "next-yak"
import { Assets } from "pixi.js"
import { useEffect } from "react"
import useMeasure from "react-use-measure"
import { queryClient } from "temp/components/Providers/QueryProvider"
import type { City } from "temp/data/useCities"
import type { MarkersResponse } from "temp/types/dynmapMarkers"

import AllCities from "./Cities"
import DynmapMarkers from "./Dynmap/DynmapMarkers"
import PixiHooks from "./PixiHooks"
import { PixiViewport } from "./PixiViewport"
import Satellite from "./Satellite"

export default function MapBase({
	initialMarkers,
	initialCities,
}: {
	initialMarkers: MarkersResponse
	initialCities: City[]
}) {
	const [ref, bounds] = useMeasure()
	const { width, height } = bounds

	/**
	 * prevent scroll events from bubbling up to the document
	 */
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			if (e.target instanceof HTMLCanvasElement) {
				e.preventDefault()
			}
		}
		document.addEventListener("wheel", handleWheel, { passive: false })
		return () => {
			document.removeEventListener("wheel", handleWheel)
		}
	}, [])

	useEffect(() => {
		Assets.load(
			"https://dynmap.minecartrapidtransit.net/main/tiles/new/flat/0_0/zzzzzzzz_0_0.png",
		)
			.finally(() => {
				gsap.to("canvas", {
					opacity: 1,
					duration: 1,
					ease: "power2.out",
				})
			})
			.catch(console.error)
	}, [])

	return (
		<Wrapper ref={ref}>
			<Stage width={width} height={height}>
				<QueryClientProvider client={queryClient}>
					<PixiViewport width={width} height={height}>
						<Satellite />
						<DynmapMarkers initialMarkers={initialMarkers} />
						<AllCities initialCities={initialCities} />
						<PixiHooks />
					</PixiViewport>
				</QueryClientProvider>
			</Stage>
		</Wrapper>
	)
}

const Wrapper = styled.div`
	width: 100%;
	height: 100%;

	& canvas {
		position: absolute;
		inset: 0;
		opacity: 0;
	}
`
