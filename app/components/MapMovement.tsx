"use client"

import { setParamManually } from "app/utils/useSearchParamState"
import { type SpringOptions, useSpring } from "framer-motion"
import type { Viewport } from "pixi-viewport"
import {
	type MutableRefObject,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
import { CLAMP, triggerMovementManually } from "./Map/PixiViewport"

type Coordinate =
	| {
			x: number
			z: number
			worldScreenWidth: number
	  }
	| {
			x: number
			z: number
			zoom: number
	  }

export const MovementContext = createContext<{
	moveCamera: (coordinate: Partial<Coordinate>) => void
	viewport: Viewport | null
	setViewport: (viewport: Viewport | null) => void
	/**
	 * if the method is touch, it means the user has moved the camera using touch and we shouldn't spring the values
	 * if the mothed is moveCamera, we should spring the values
	 */
	lastUsedMethod: MutableRefObject<"moveCamera" | "touchStillActive" | "touch">
}>({
	moveCamera: () => {},
	viewport: null,
	setViewport: () => {},
	lastUsedMethod: { current: "touch" },
})

export const useCamera = () => {
	const { moveCamera } = useContext(MovementContext)
	return { moveCamera }
}

export function MovementProvider({ children }: { children: React.ReactNode }) {
	const [viewport, setViewport] = useState<Viewport | null>(null)
	const lastUsedMethod = useRef<"moveCamera" | "touch" | "touchStillActive">(
		"touch",
	)

	const options: SpringOptions = {
		bounce: 0.1,
		duration: 2000,
		stiffness: 50,
	}
	const xSpring = useSpring(0, options)
	const zSpring = useSpring(0, options)
	const worldScreenWidthSpring = useSpring(0, { bounce: 0, stiffness: 20 })

	const moveCamera = (coordinate: Partial<Coordinate>) => {
		if (lastUsedMethod.current === "touchStillActive") return
		lastUsedMethod.current = "moveCamera"

		if (coordinate.x !== undefined) xSpring.set(coordinate.x)
		if (coordinate.z !== undefined) zSpring.set(coordinate.z)
		if (
			"worldScreenWidth" in coordinate &&
			coordinate.worldScreenWidth !== undefined
		)
			worldScreenWidthSpring.set(
				Math.min(
					CLAMP.maxWorldScreenWidth,
					Math.max(CLAMP.minWorldScreenWidth, coordinate.worldScreenWidth),
				),
			)
		else if (
			"zoom" in coordinate &&
			coordinate.zoom !== undefined &&
			viewport
		) {
			const currentZoom = viewport.scale.x
			viewport.setZoom(coordinate.zoom, true)
			const newWorldScreenWidth = viewport.worldScreenWidth
			viewport.setZoom(currentZoom, true)
			worldScreenWidthSpring.set(newWorldScreenWidth)
		}
	}

	useEffect(() => {
		if (!viewport) return

		xSpring.jump(viewport.center.x)
		zSpring.jump(viewport.center.y)
		worldScreenWidthSpring.jump(viewport.worldScreenWidth)

		const resetIfApplicable = () => {
			if (lastUsedMethod.current === "moveCamera") return

			xSpring.jump(viewport.center.x)
			zSpring.jump(viewport.center.y)
			worldScreenWidthSpring.jump(viewport.worldScreenWidth)
		}

		let batchTimeout: ReturnType<typeof setTimeout> | null = null
		let batchFrame: ReturnType<typeof requestAnimationFrame> | null = null
		let nextValue: Partial<{
			x: number
			z: number
			worldScreenWidth: number
		}> = {}

		const batchUpdate = () => {
			if (batchTimeout) clearTimeout(batchTimeout)
			batchTimeout = setTimeout(() => {
				resetIfApplicable()
				if (lastUsedMethod.current !== "moveCamera") return
				viewport.moveCenter(
					nextValue.x ?? viewport.center.x,
					nextValue.z ?? viewport.center.y,
				)

				const zoom = nextValue.worldScreenWidth
					? viewport.findFitWidth(nextValue.worldScreenWidth)
					: viewport.scale.x

				viewport.setZoom(zoom, true)

				if (batchFrame) cancelAnimationFrame(batchFrame)
				batchFrame = requestAnimationFrame(triggerMovementManually)

				nextValue = {}

				setParamManually("x", Math.round(viewport.center.x).toString())
				setParamManually("z", Math.round(viewport.center.y).toString())
				setParamManually("zoom", Number(viewport.scale.x.toFixed(4)).toString())
			})
		}

		const unsubscribeX = xSpring.on("change", (x) => {
			nextValue.x = x
			batchUpdate()
		})
		const unsubscribeY = zSpring.on("change", (z) => {
			nextValue.z = z
			batchUpdate()
		})
		const unsubscribeZoom = worldScreenWidthSpring.on(
			"change",
			(worldScreenWidth) => {
				nextValue.worldScreenWidth = worldScreenWidth
				batchUpdate()
			},
		)

		viewport?.addEventListener("moved", resetIfApplicable)

		return () => {
			unsubscribeX()
			unsubscribeY()
			unsubscribeZoom()
			viewport.removeEventListener("moved", resetIfApplicable)
		}
	}, [viewport, xSpring, zSpring, worldScreenWidthSpring])

	return (
		<MovementContext.Provider
			value={{
				moveCamera,
				viewport,
				setViewport,
				lastUsedMethod,
			}}
		>
			{children}
		</MovementContext.Provider>
	)
}
