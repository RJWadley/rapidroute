import { useEffect, useRef, useState } from "react"

import { getLocal, setLocal } from "utils/localUtils"

import { useViewport, useViewportMoved } from "./PixiViewport"

export default function useUrlParams() {
  const viewport = useViewport()

  const lastUpdate = useRef(0)

  const [loadedAt] = useState(Date.now())

  const updateParams = () => {
    if (!viewport) return
    if (viewport.destroyed) return

    // don't update the URL too much
    const now = Date.now()
    const diff = now - lastUpdate.current
    const maxInterval = 200
    if (diff < maxInterval) {
      setTimeout(updateParams, maxInterval - diff)
      return
    }
    lastUpdate.current = now

    // don't update the URL within the first few seconds
    if (now - loadedAt < 5 * 1000) return

    const { center } = viewport
    const zoom = Math.round(viewport.scale.x * 10000) / 10000

    if (Number.isNaN(center.x) || Number.isNaN(center.y) || Number.isNaN(zoom))
      return

    setLocal("x", center.x)
    setLocal("z", center.y)
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
