import { useEventListener } from "ahooks"
import { useState } from "react"

/**
 * determine if the user is using a mousepad vs a scrollwheel
 */
export function useScrollInputType() {
	const [lastHundredScrollDeltas, setLastHundredScrollDeltas] = useState<
		number[]
	>([])

	useEventListener("wheel", (e) => {
		setLastHundredScrollDeltas((lastHundredScrollDeltas) => {
			const newDeltas = [...lastHundredScrollDeltas, Math.abs(e.deltaY)]
			if (newDeltas.length > 100) {
				newDeltas.shift()
			}
			return newDeltas
		})
	})

	const isTouchpad = lastHundredScrollDeltas.some((delta) => delta < 16)
	return isTouchpad ? "touchpad" : "mouse"
}
