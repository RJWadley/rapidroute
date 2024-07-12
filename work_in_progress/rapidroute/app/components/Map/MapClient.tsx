"use client"

import { Application, extend } from "@pixi/react"
import { Container, Graphics } from "pixi.js"
import { useEffect, useRef, useState } from "react"
import PixiViewport from "./PixiViewport"
import Satellite from "./Satellite"
import { styled } from "@pigment-css/react"
import DynmapMarkers from "./Dynmap/DynmapMarkers"
import type { MarkersResponse } from "./Dynmap/dynmapType"

extend({
	Container,
	Graphics,
})

export default function MapClient({
	initialMarkers,
}: { initialMarkers: MarkersResponse }) {
	const [hasInit, setHasInit] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)

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

	return (
		<Wrapper ref={wrapperRef}>
			<Application
				antialias
				autoDensity
				onInit={() => setHasInit(true)}
				resizeTo={wrapperRef}
				background="#546461"
				resolution={window.devicePixelRatio}
			>
				{hasInit && (
					<PixiViewport>
						<Satellite />
						<DynmapMarkers initialMarkers={initialMarkers} />
					</PixiViewport>
				)}
			</Application>
		</Wrapper>
	)
}

const Wrapper = styled.div`
	width: calc(100vw - 20px);
	height: calc(100vh - 20px);
	border: 1px solid red;
`
