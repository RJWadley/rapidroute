import { PixiComponent, useApp } from "@pixi/react"
import { Viewport } from "pixi-viewport"
import { Application } from "pixi.js"
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"

interface ViewportProps {
	width: number
	height: number
	children: ReactNode
}

export const worldSize = 61_000

const _temp = new Application()

const DisplayViewport = PixiComponent("Viewport", {
	create: ({
		width,
		height,
		app,
		setViewport,
	}: ViewportProps & {
		app: ReturnType<typeof useApp>
		setViewport: (viewport: Viewport) => void
	}) => {
		const halfSize = worldSize / 2
		const viewport = new Viewport({
			screenWidth: width,
			screenHeight: height,
			worldHeight: halfSize,
			worldWidth: halfSize,
			events: app.renderer.events,
			allowPreserveDragOutside: true,
		})
		viewport.drag().pinch().wheel().decelerate()

		const check = () => {
			if (viewport.screenHeight) {
				viewport
					.moveCenter(0, 0)
					.setZoom(0.5)
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
				app.ticker.remove(check)
			}
		}

		app.ticker.add(check)

		setViewport(viewport)
		return viewport
	},
	applyProps: (instance, __, newProps) => {
		if (instance instanceof Viewport) {
			instance.resize(newProps.width, newProps.height)
		}
	},
	willUnmount: (instance) => {
		// biome-ignore lint/complexity/noForEach: <explanation>
		instance.children.forEach((child) => {
			child.destroy()
		})
		try {
			instance.destroy({
				children: false,
			})
		} catch (error) {
			// this can fail if the domElement doesn't exist anymore. pixi-viewport issue?
		}
	},
	config: {
		destroy: false,
		destroyChildren: false,
	},
})

const ViewportContext = createContext<Viewport | null>(null)

export const useViewport = () => {
	return useContext(ViewportContext)
}

let moveCallbacks: (() => void)[] = []
/**
 * run a function when the viewport is moved
 * @param callback the callback to be called when the viewport is moved
 */
export const useViewportMoved = (callback: () => void) => {
	const viewport = useViewport()
	const firstRender = useRef(true)

	// for the first five seconds, run the callback every 100ms
	// this is to ensure that the viewport is fully initialized
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
			useEffect(() => {
		let isMounted = true
		const onViewportMoved = () => {
			if (isMounted && viewport && !viewport.destroyed) {
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
			isMounted = false
			viewport?.removeEventListener("moved", onViewportMoved)
			moveCallbacks = moveCallbacks.filter((cb) => cb !== onViewportMoved)
		}
		// we only want to run this on the first render
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewport])
}

/**
 * trigger the movement callbacks manually
 */
export const triggerMovementManually = () => {
	// biome-ignore lint/complexity/noForEach: <explanation>
	moveCallbacks.forEach((cb) => cb())
}

export function PixiViewport({
	children,
	width,
	height,
}: {
	children: React.ReactNode
	width: number
	height: number
}) {
	const [viewport, setViewport] = useState<Viewport | null>(null)

	return (
		<ViewportContext.Provider value={viewport}>
			<DisplayViewport
				setViewport={setViewport}
				width={width}
				height={height}
				app={useApp()}
			>
				{children}
			</DisplayViewport>
		</ViewportContext.Provider>
	)
}
