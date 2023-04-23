import { Container, Sprite } from "@pixi/react"
import PinPNG from "assets/images/pin.png"
import { MapSearchContext } from "components/Providers/MapSearchContext"
import { getPath } from "data/getData"
import { Container as PixiContainer, Point, Texture } from "pixi.js"
import { useContext, useEffect, useRef, useState } from "react"
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

    const debounce = setTimeout(() => {
      getPath("locations", activeItem)
        .then(newLocation => {
          if (newLocation?.location && viewport) {
            const newPoint = new Point(
              newLocation.location.x,
              newLocation.location.z
            )
            setLocation(newPoint)
            return zoomToPoint(newPoint, viewport, 250)
          }
          return null
        })
        .catch(console.error)
    }, 250)
    return () => clearTimeout(debounce)
  }, [activeItem, viewport])

  if (!location) return null
  return (
    <Container x={location.x} y={location.y} ref={containerRef}>
      <Sprite texture={pinTexture} anchor={[0.5, 1]} height={45} width={25} />
    </Container>
  )
}
