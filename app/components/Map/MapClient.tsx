"use client"

import { styled } from "@linaria/react"
import { Application, extend } from "@pixi/react"
import { Container, Graphics } from "pixi.js"
import { useEffect, useRef, useState } from "react"
import DynmapMarkers from "./Dynmap/DynmapMarkers"
import type { MarkersResponse } from "./Dynmap/dynmapType"
import PixiViewport from "./PixiViewport"
import Satellite from "./Satellite"

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
				resolution={typeof window !== "undefined" ? window.devicePixelRatio : 1}
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
position: absolute;
inset: 0;
width: 100%;
height: 100%;
z-index: 1;
background: #546461;
`
