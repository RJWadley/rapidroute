import { useEffect } from "react"

import { usePixiApp } from "react-pixi-fiber"

import useCameraSearch from "./useCameraSearch"
import useDoubleTapZoom from "./useDoubleTapZoom"
import { useUpdateOverlapping } from "./useHideOverlapping"
import useUrlParams from "./useUrlParams"

/**
 * A place to put global hooks that need to be in the pixi context
 */
export default function PixiHooks() {
  useUrlParams()
  useUpdateOverlapping()
  useDoubleTapZoom()

  const app = usePixiApp()

  useEffect(() => {
    const maxResolution = 2
    const minResolution = 1

    app.renderer.resolution = Math.min(
      maxResolution,
      Math.max(minResolution, window.devicePixelRatio)
    )
  }, [app.renderer])

  return null
}
