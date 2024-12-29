"use client"

import { styled } from "@linaria/react"
import { Application, extend } from "@pixi/react"
import { TanstackProvider } from "app/TanstackProvider"
import { Container, Graphics } from "pixi.js"
import { useContext, useRef, useState } from "react"
import { MovementContext } from "../MapMovement"
import DynmapMarkers from "./Dynmap/DynmapMarkers"
import type { MarkersResponse } from "./Dynmap/dynmapType"
import PixiViewport from "./PixiViewport"
import Satellite from "./Satellite"
import { useEventListener } from "ahooks"
import { skewWorldCoordinate } from "./pixiUtils"

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
	useEventListener(
		"wheel",
		(e) => {
			if (e.target instanceof HTMLCanvasElement) {
				e.preventDefault()
			}
		},
		{ passive: false },
	)

	/**
	 * prevent selection of app text while dragging
	 */
	useEventListener(
		"pointerdown",
		(e) => {
			if (e.target instanceof HTMLCanvasElement) {
				e.preventDefault()
			}
		},
		{ passive: false },
	)

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
	min-width: 100%;
	min-height: 100%;
	aspect-ratio: 1;
	position: absolute;
	top: 50%;
	left: 50%;
	translate: -50% -50%;
	z-index: -1;
	pointer-events: none;
`

const Background = styled.div`
	position: absolute;
	inset:0;
	z-index: -2;
	background: #546461;
`
