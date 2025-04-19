import { extend, useApplication, type PixiReactElementProps } from "@pixi/react"
import { setShallowParam, getShallowParam } from "app/utils/shallow-params"
import { Viewport } from "pixi-viewport"
import {
	createContext,
	use,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
	type RefObject,
} from "react"
import { useLocalIsometric } from "app/utils/locals"

extend({ Viewport })

declare module "@pixi/react" {
	interface PixiElements {
		viewport: PixiReactElementProps<typeof Viewport>
	}
}

export const WORLD_SIZE = 61_000
export const HALF_WORLD_SIZE = WORLD_SIZE / 2

const ViewportContext = createContext<{
	viewport: Viewport | null
	movementCallbacks: RefObject<Record<string, (viewport: Viewport) => void>>
}>({
	viewport: null,
	movementCallbacks: { current: Object.freeze({}) },
})

/**
 * utility hook for getting the viewport
 */
export const useViewport = () => {
	return useContext(ViewportContext).viewport
}

/**
 * run a function when the viewport is moved
 * @param callback the callback to be called when the viewport is moved
 */
export const useViewportMoved = (callback: (viewport: Viewport) => void) => {
	const { movementCallbacks } = use(ViewportContext)
	const latestCallback = useRef(callback)
	latestCallback.current = callback

	useEffect(() => {
		const key = crypto.randomUUID()
		movementCallbacks.current[key] = (viewport) => {
			latestCallback.current(viewport)
		}

		return () => {
			delete movementCallbacks.current[key]
		}
	}, [movementCallbacks])
}

export function PixiViewport({
	children,
}: {
	children: ReactNode
}) {
	const { app, isInitialised } = useApplication()

	const [isometric] = useLocalIsometric()
	const [viewport, setViewport] = useState<Viewport | null>(null)
	const movementCallbacks = useRef<
		Record<string, (viewport: Viewport) => void>
	>({})

	/**
	 * viewport setup
	 */
	useEffect(() => {
		if (!viewport) return

		const x = getShallowParam("x")
		const z = getShallowParam("z")
		const zoom = getShallowParam("zoom")

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
				maxHeight: WORLD_SIZE * 2,
				maxWidth: WORLD_SIZE * 2,
				minHeight: 100,
				minWidth: 100,
			})
			.clamp({
				top: -WORLD_SIZE,
				left: -WORLD_SIZE,
				bottom: WORLD_SIZE,
				right: WORLD_SIZE,
				underflow: "none",
			})
			.setZoom(zoom)
			.moveCenter({
				x,
				y: z,
			})

		const onMove = () => {
			setShallowParam("x", Math.round(viewport.center.x).toString())
			setShallowParam("z", Math.round(viewport.center.y).toString())
			setShallowParam("zoom", Number(viewport.scale.x.toFixed(4)).toString())

			for (const callback of Object.values(movementCallbacks.current)) {
				callback(viewport)
			}
		}

		onMove()
		requestAnimationFrame(onMove)
		viewport.addEventListener("moved", onMove)
		const interval = setInterval(onMove, 1000)

		return () => {
			viewport.removeEventListener("moved", onMove)
			clearInterval(interval)
		}
	}, [viewport])

	/**
	 * preserve coordinates when switching isometric <-> flat
	 */
	// useEffect(() => {
	// 	if (!viewport) return

	// 	const converted = isometric
	// 		? convertPointToIsometric({
	// 				x: viewport.center.x,
	// 				z: viewport.center.y,
	// 			})
	// 		: convertPointFromIsometric({
	// 				x: viewport.center.x,
	// 				z: viewport.center.y,
	// 			})

	// 	viewport.moveCenter(converted.x, converted.z)
	// }, [viewport, isometric])

	if (!isInitialised) return null
	return (
		<viewport ref={setViewport} events={app.renderer.events}>
			<ViewportContext.Provider
				value={{
					viewport,
					movementCallbacks,
				}}
			>
				{children}
			</ViewportContext.Provider>
		</viewport>
	)
}
