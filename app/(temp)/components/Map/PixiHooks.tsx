import { useUpdateOverlapping } from "./useHideOverlapping"

/**
 * A place to put global hooks that need to be in the pixi context
 */
export default function PixiHooks() {
	// useUrlParams()
	useUpdateOverlapping()
	// useDoubleTapZoom()

	return null
}
