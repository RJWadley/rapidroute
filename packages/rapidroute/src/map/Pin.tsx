import { useContext, useEffect, useRef, useState } from "react"

import { Point, Texture } from "pixi.js"
import { Container, Sprite } from "react-pixi-fiber"

import PinPNG from "assets/images/pin.png"
import { MapSearchContext } from "components/Providers/MapSearchContext"
import { getPath } from "data/getData"
import { clearLocal } from "utils/localUtils"

import { useViewport, useViewportMoved } from "./PixiViewport"
import { zoomToPoint } from "./zoomCamera"

export default function Pin() {
  const viewport = useViewport()
  const containerRef = useRef<Container>(null)
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
    const timeout = setTimeout(() => {
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
    }, 250)
    return () => clearTimeout(timeout)
  }, [activeItem, viewport])

  if (!location) return null
  return (
    <Container x={location.x} y={location.y} ref={containerRef}>
      <Sprite
        texture={Texture.from(PinPNG)}
        anchor="0.5, 1"
        height={45}
        width={25}
      />
    </Container>
  )
}