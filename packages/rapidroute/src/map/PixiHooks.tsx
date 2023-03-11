import { useEffect } from "react"

import { usePixiApp } from "react-pixi-fiber"

import { useUpdateOverlapping } from "./useHideOverlapping"
import useUrlParams from "./useUrlParams"

/**
 * A place to put global hooks that need to be in the pixi context
 */
export default function PixiHooks() {
  useUrlParams()
  useUpdateOverlapping()

  const app = usePixiApp()

  useEffect(() => {
  const maxResolution = 2
  const minResolution = 1

    app.renderer.resolution = Math.min(
      maxResolution,
      Math.max(minResolution, window.devicePixelRatio)
    )
  })

  return null
}
