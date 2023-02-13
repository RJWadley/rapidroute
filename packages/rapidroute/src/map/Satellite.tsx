import { useState, useEffect } from "react"

import { Viewport } from "pixi-viewport"

import { useViewport } from "./PixiViewport"
import SatelliteLayer from "./SatelliteLayer"

const breakpoints = [Infinity, 30, 15, 10, 4.5, 2.3, 1.5, 0.6]

const getMaxZoom = (viewport: Viewport | null): number => {
  const worldWidth = viewport?.screenWidth ?? 0
  const screenWidth = viewport?.screenWidthInWorldPixels ?? 0

  const density = screenWidth / worldWidth

  // return the largest zoom level where the density is smaller than the breakpoint
  for (let i = breakpoints.length - 1; i >= 0; i -= 1) {
    if (density < breakpoints[i]) {
      return i
    }
  }
  return 99
}

export default function Satellite() {
  const [maxZoom, setMaxZoom] = useState(0)
  const viewport = useViewport()

  useEffect(() => {
    const onMoved = () => {
      const newMax = getMaxZoom(viewport)
      setMaxZoom(newMax)
    }
    viewport?.addEventListener("moved", onMoved)
    return () => {
      viewport?.removeEventListener("moved", onMoved)
    }
  }, [viewport])

  return (
    <>
      {breakpoints.map(
        (breakpoint, i) =>
          i <= maxZoom && <SatelliteLayer key={breakpoint} zoomLevel={i} />
      )}
    </>
  )
}
