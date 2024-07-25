import { extend, useApp } from "@pixi/react"
import type { PixiReactNode } from "@pixi/react"
import { useEventListener } from "ahooks"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { Viewport } from "pixi-viewport"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import useIsMounted from "../../utils/useIsMounted"

extend({ Viewport })

export const worldSize = 61_000
const halfSize = worldSize / 2

const ViewportContext = createContext<Viewport | null>(null)
let moveCallbacks: (() => void)[] = []

/**
 * utility hook for getting the viewport
 */
export const useViewport = () => {
	return useContext(ViewportContext)
}

/**
 * run a function when the viewport is moved
 * @param callback the callback to be called when the viewport is moved
 */
export const useViewportMoved = (callback: () => void) => {
	const latestCallback = useRef(callback)
	latestCallback.current = callback

	const viewport = useViewport()
	const firstRender = useRef(true)
	const isMounted = useIsMounted()

	// for the first five seconds, run the callback every 100ms
	// this is to ensure that the viewport is fully initialized
	useEffect(() => {
		const callback = () => latestCallback.current()

		const onViewportMoved = () => {
			if (isMounted.current && viewport && !viewport.destroyed) {
				callback()
			}
		}

		const startupInterval =
			firstRender.current && setInterval(onViewportMoved, 100)
		setTimeout(() => {
			if (startupInterval) clearInterval(startupInterval)
		}, 2000)

		viewport?.addEventListener("moved", onViewportMoved)
		moveCallbacks.push(onViewportMoved)
		return () => {
			viewport?.removeEventListener("moved", onViewportMoved)
			moveCallbacks = moveCallbacks.filter((cb) => cb !== onViewportMoved)
		}
	}, [viewport, isMounted])
}

/**
 * trigger the movement callbacks manually
 */
export const triggerMovementManually = () => {
	for (const cb of moveCallbacks) {
		cb()
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			viewport: PixiReactNode<typeof Viewport>
		}
	}
}

export default function PixiViewport({
	children,
}: {
	children: React.ReactNode
}) {
	const app = useApp()
	const [viewport, setViewport] = useState<Viewport | null>(null)
	const [xRaw, setX] = useSearchParamState("x")
	const [zRaw, setZ] = useSearchParamState("z")
	const [zoomRaw, setZoom] = useSearchParamState("zoom")

	const x = xRaw ? Number.parseFloat(xRaw) : 0
	const z = zRaw ? Number.parseFloat(zRaw) : 0
	const zoom = zoomRaw ? Number.parseFloat(zoomRaw) : 0.5
	const hasInit = useRef(false)

	if (Number.isNaN(x)) setX("0")
	if (Number.isNaN(z)) setZ("0")
	if (Number.isNaN(zoom)) setZoom("0.5")

	useEffect(() => {
		if (!viewport) return
		if (hasInit.current) return
		hasInit.current = true

		viewport
			.drag()
			.pinch()
			.wheel()
			.decelerate()
			.setZoom(zoom)
			.moveCenter({
				x,
				y: z,
			})
			.clampZoom({
				maxHeight: worldSize * 2,
				maxWidth: worldSize * 2,
				minHeight: 100,
				minWidth: 100,
			})
			.clamp({
				top: -worldSize,
				left: -worldSize,
				bottom: worldSize,
				right: worldSize,
				underflow: "none",
			})
			.addEventListener("moved", () => {
				setX(Math.round(viewport.center.x).toString())
				setZ(Math.round(viewport.center.y).toString())
				setZoom(Number(viewport.scale.x.toFixed(4)).toString())
			})
	}, [viewport, x, z, zoom, setX, setZ, setZoom])

	useEventListener("resize", () => {
		if (app)
			viewport?.resize(app.screen.width, app.screen.height, halfSize, halfSize)
	})

	if (!app) return null
	return (
		<viewport
			ref={setViewport}
			events={app.renderer.events}
			worldHeight={halfSize}
			worldWidth={halfSize}
			screenHeight={app.screen.height}
			screenWidth={app.screen.width}
			allowPreserveDragOutside
		>
			<ViewportContext.Provider value={viewport}>
				{children}
			</ViewportContext.Provider>
		</viewport>
	)
}
