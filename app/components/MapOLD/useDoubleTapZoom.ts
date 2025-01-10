// import { useEffect } from "react"

// import { getDistance } from "pathfinding/findPath/pathUtil"

// import {
// 	triggerMovementManually,
// 	useViewport,
// } from "./packages/rapidroute/src/map/PixiViewport"

// /**
//  * if the user double taps, enable zooming
//  * adjust the zoom based on the distance their finger moves vertically until they lift their finger
//  */
// export default function useDoubleTapZoom() {
// 	const viewport = useViewport()

// 	useEffect(() => {
// 		let firstTap = 0
// 		let isZooming = false
// 		let previousY = 0
// 		let previousX = 0
// 		const distances: number[] = []
// 		let dy = 0
// 		const TOUCH_TAP_TIME = 500
// 		const MAX_TAP_DISTANCE = 30

// 		const onTouchStart = (e: TouchEvent) => {
// 			const now = Date.now()
// 			if (now - firstTap < TOUCH_TAP_TIME) {
// 				if (e.touches.length > 1) return
// 				const distanceBetweenTaps = getDistance(
// 					previousX,
// 					previousY,
// 					e.touches[0].clientX,
// 					e.touches[0].clientY,
// 				)
// 				if (distanceBetweenTaps > MAX_TAP_DISTANCE) return
// 				isZooming = true
// 				firstTap = 0
// 				previousY = e.touches[0].clientY
// 				previousX = e.touches[0].clientX
// 				dy = 0
// 				if (viewport) viewport.pause = true
// 			} else {
// 				if (e.touches.length > 1) return
// 				previousY = e.touches[0].clientY
// 				previousX = e.touches[0].clientX
// 				firstTap = now
// 			}
// 		}

// 		const onTouchEnd = () => {
// 			if (isZooming) {
// 				isZooming = false
// 				if (viewport) viewport.pause = false
// 				if (distances.length > 0) {
// 					dy = distances.reduce((a, b) => a + b) / distances.length
// 				}

// 				const animate = () => {
// 					if (Math.abs(dy) > 0.1) {
// 						viewport?.zoomPercent(dy / 100, true)
// 						triggerMovementManually()
// 						dy *= 0.9
// 						requestAnimationFrame(animate)
// 					}
// 				}
// 				requestAnimationFrame(animate)
// 			}
// 		}

// 		const onTouchMove = (e: TouchEvent) => {
// 			if (isZooming) {
// 				e.preventDefault()
// 				e.stopPropagation()
// 				const distance = e.touches[0].clientY - previousY
// 				viewport?.zoomPercent(distance / 100, true)
// 				previousY = e.touches[0].clientY
// 				distances.push(distance)
// 				if (distances.length > 10) distances.shift()
// 				triggerMovementManually()
// 			}
// 		}

// 		window.addEventListener("touchstart", onTouchStart)
// 		window.addEventListener("touchend", onTouchEnd)
// 		window.addEventListener("touchmove", onTouchMove)
// 		return () => {
// 			window.removeEventListener("touchstart", onTouchStart)
// 			window.removeEventListener("touchend", onTouchEnd)
// 			window.removeEventListener("touchmove", onTouchMove)
// 		}
// 	}, [viewport])
// }
