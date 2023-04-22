import { useEffect, useState } from "react"
import { getLocal, setLocal } from "utils/localUtils"

import { useViewport, useViewportMoved } from "./PixiViewport"

export default function useUrlParams() {
  const viewport = useViewport()
  const [loadedAt] = useState(Date.now())

  const updateParams = () => {
    if (!viewport) return
    if (viewport.destroyed) return

    // don't update the URL within the first few seconds
    const now = Date.now()
    if (now - loadedAt < 5 * 1000) return

    const { center } = viewport
    const zoom = Math.round(viewport.scale.x * 1000) / 1000

    if (Number.isNaN(center.x) || Number.isNaN(center.y) || Number.isNaN(zoom))
      return

    setLocal("x", Math.round(center.x))
    setLocal("z", Math.round(center.y))
    setLocal("zoom", zoom)
  }
  useViewportMoved(updateParams)

  /**
   * pull the URL params on the first render
   */
  useEffect(() => {
    setTimeout(() => {
      if (viewport) {
        const x = getLocal("x")
        const z = getLocal("z")
        const zoom = getLocal("zoom")

        if (
          Number.isFinite(x) &&
          Number.isFinite(z) &&
          Number.isFinite(zoom) &&
          !viewport.destroyed
        ) {
          if (x && z)
            viewport.moveCenter({
              x,
              y: z,
            })
          if (zoom) viewport.setZoom(zoom, true)
        }
      }
    }, 200)
  }, [viewport])
}
