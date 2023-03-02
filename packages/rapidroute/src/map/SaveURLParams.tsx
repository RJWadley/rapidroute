import { useRef, useState } from "react"

import { session } from "utils/localUtils"

import { useViewport, useViewportMoved } from "./PixiViewport"

export default function SaveURLParams() {
  const viewport = useViewport()

  const lastUpdate = useRef(0)

  const [loadedAt] = useState(Date.now())

  const updateParams = () => {
    if (!viewport) return

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
    const zoom = viewport.scale.x
    const following = session.followingPlayer

    const params = new URLSearchParams(window.location.search)
    params.set("x", Math.round(center.x).toString())
    params.set("z", Math.round(center.y).toString())
    params.set("zoom", zoom.toString())
    if (following) params.set("following", following)
    else params.delete("following")
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    )
  }
  useViewportMoved(updateParams)

  return null
}
