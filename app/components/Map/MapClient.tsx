"use client"

import { styled } from "@linaria/react"
import { Application, extend } from "@pixi/react"
import { TanstackProvider } from "app/TanstackProvider"
import { Container, Graphics } from "pixi.js"
import { useContext, useEffect, useRef, useState } from "react"
import { MovementContext } from "../MapMovement"
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
	previewImage,
}: { initialMarkers: MarkersResponse; previewImage: string }) {
	// return null
	const [hasInit, setHasInit] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const moveContextValue = useContext(MovementContext)

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

	const touchStart = () => {
		moveContextValue.lastUsedMethod.current = "touchStillActive"
	}
	const touchEnd = () => {
		moveContextValue.lastUsedMethod.current = "touch"
	}

	return (
		<Wrapper
			ref={wrapperRef}
			onTouchStart={touchStart}
			onTouchEnd={touchEnd}
			onPointerDown={touchStart}
			onPointerUp={touchEnd}
			onWheel={touchEnd}
		>
			<Background />
			<PreviewImage src={previewImage} loading="eager" id="mapPreview" />
			<Application
				antialias
				autoDensity
				onInit={() => setHasInit(true)}
				resizeTo={wrapperRef}
				backgroundAlpha={0}
				resolution={typeof window !== "undefined" ? window.devicePixelRatio : 1}
			>
				<MovementContext.Provider value={moveContextValue}>
					<TanstackProvider>
						{hasInit && (
							<PixiViewport>
								<Satellite />
								<DynmapMarkers initialMarkers={initialMarkers} />
							</PixiViewport>
						)}
					</TanstackProvider>
				</MovementContext.Provider>
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
	overflow:clip;
`

const PreviewImage = styled.img`
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	aspect-ratio: 1;
	z-index: -1;
	pointer-events: none;
`

const Background = styled.div`
	position: absolute;
	inset:0;
	z-index: -2;
	background: #546461;
`
