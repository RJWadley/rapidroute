"use client"

import { Application } from "@pixi/react"
import { useEventListener } from "ahooks"
import { use, useRef } from "react"
import { styled } from "restyle"
import { MovementContext } from "../MapMovement"
import { PixiHooks } from "../MapOLD/pixiUtils"
import { PixiViewport } from "./Viewport"
import type { parseMarkersWithFallback } from "./markers-schema"
import { isBrowser } from "app/utils/isBrowser"
import { Satellite } from "./Satellite"
import { Dynmap } from "./Dynmap"
import MapPlayers from "./Players"

export function MapClient({
	markers,
}: { markers: ReturnType<typeof parseMarkersWithFallback> }) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const { lastUsedMethod } = use(MovementContext)

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

	/**
	 * propogate touch events to the map movement provider
	 */
	const touchStart = () => {
		lastUsedMethod.current = "touchStillActive"
	}
	const touchEnd = () => {
		lastUsedMethod.current = "touch"
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
			<Application
				resizeTo={wrapperRef}
				backgroundAlpha={0}
				antialias
				autoDensity
				resolution={isBrowser ? window.devicePixelRatio : 1}
			>
				<PixiViewport>
					<PixiHooks />
					<Satellite />
					{markers.data && <Dynmap markers={markers.data} />}
					<MapPlayers />
				</PixiViewport>
			</Application>
		</Wrapper>
	)
}

const Wrapper = styled("div", {
	position: "absolute",
	inset: "0",
	width: "100%",
	height: "100%",
	zIndex: "1",
	overflow: "clip",
})

const Background = styled("div", {
	position: "absolute",
	inset: 0,
	zIndex: -2,
	background: "#546461",
})
