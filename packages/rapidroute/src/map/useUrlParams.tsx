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
    const following = getLocal("followingPlayer")

    if (Number.isNaN(center.x) || Number.isNaN(center.y) || Number.isNaN(zoom))
      return

    const params = new URLSearchParams(window.location.search)
    params.set("x", Math.round(center.x).toString())
    params.set("z", Math.round(center.y).toString())
    params.set("zoom", zoom.toString())
    // if (following) params.set("following", following)
    // else params.delete("following")
    // window.history.replaceState(
    //   {},
    //   "",
    //   `${window.location.pathname}?${params.toString()}`
    // )
  }
  useViewportMoved(updateParams)

  /**
   * pull the URL params on the first render
   */
  useEffect(() => {
    setTimeout(() => {
      if (viewport) {
        const params = new URLSearchParams(window.location.search)
        const x = parseFloat(params.get("x") ?? "")
        const z = parseFloat(params.get("z") ?? "")
        const zoom = parseFloat(params.get("zoom") ?? "")
        const following = params.get("following")

        if (
          Number.isFinite(x) &&
          Number.isFinite(z) &&
          Number.isFinite(zoom) &&
          !viewport.destroyed
        ) {
          viewport.moveCenter({
            x,
            y: z,
          })
          viewport.setZoom(zoom, true)
          if (following) setLocal("followingPlayer", following)
        }
      }
    }, 200)
  }, [viewport])
}
