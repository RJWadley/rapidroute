import { useApp } from "@pixi/react"
import { isBrowser } from "utils/functions"

import useDoubleTapZoom from "./useDoubleTapZoom"
import { useUpdateOverlapping } from "./useHideOverlapping"
import useUrlParams from "./useUrlParams"

const getDPR = () => {
  return isBrowser() ? window.devicePixelRatio : 1
}

/**
 * A place to put global hooks that need to be in the pixi context
 */
export default function PixiHooks() {
  useUrlParams()
  useUpdateOverlapping()
  useDoubleTapZoom()

  const app = useApp()

  app.renderer.resolution = getDPR()

  return null
}
