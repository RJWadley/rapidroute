import { useContext, useEffect, useRef, useState } from "react"

import { Container, Sprite } from "@pixi/react"
import { Point, Texture, Container as PixiContainer } from "pixi.js"

import PinPNG from "assets/images/pin.png"
import { MapSearchContext } from "components/Providers/MapSearchContext"
import { getPath } from "data/getData"
import { isBrowser } from "utils/functions"
import { clearLocal } from "utils/localUtils"

import { useViewport, useViewportMoved } from "./PixiViewport"
import { zoomToPoint } from "./zoomCamera"

const pinTexture = isBrowser() ? Texture.from(PinPNG) : undefined

export default function Pin() {
  const viewport = useViewport()
  const containerRef = useRef<PixiContainer>(null)
  const { activeItem } = useContext(MapSearchContext)
  const [location, setLocation] = useState<Point>()

  const onMove = () => {
    if (containerRef.current && viewport) {
      containerRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
    }
  }
  useViewportMoved(onMove)

  useEffect(() => {
    setLocation(undefined)
    if (!activeItem) {
      return
    }
    clearLocal("lastMapInteraction")
    getPath("locations", activeItem)
      .then(newLocation => {
        if (newLocation?.location && viewport) {
          const newPoint = new Point(
            newLocation.location.x,
            newLocation.location.z
          )
          setLocation(newPoint)
          zoomToPoint(newPoint, viewport, 250).catch(() => {})
        }
      })
      .catch(() => {})
  }, [activeItem, viewport])

  if (!location) return null
  return (
    <Container x={location.x} y={location.y} ref={containerRef}>
      <Sprite texture={pinTexture} anchor={[0.5, 1]} height={45} width={25} />
    </Container>
  )
}
