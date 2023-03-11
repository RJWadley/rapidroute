import { useUpdateOverlapping } from "./useHideOverlapping"
import useUrlParams from "./useUrlParams"

/**
 * A place to put global hooks that need to be in the pixi context
 */
export default function PixiHooks() {
  useUrlParams()
  useUpdateOverlapping()

  return null
}
