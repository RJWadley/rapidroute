import { useRef, useState } from "react"

import { Point } from "pixi.js"
import { Text } from "react-pixi-fiber"

import { session } from "utils/localUtils"

import useHideOverlapping, { PriorityType } from "./hideOverlapping"
import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular, regularHover } from "./textStyles"
import { zoomToPoint } from "./zoomCamera"

interface CityMarkerProps {
  name: string
  x: number
  z: number
  priority: PriorityType
}

export default function CityMarker({ name, x, z, priority }: CityMarkerProps) {
  const viewport = useViewport()
  const textRef = useRef<Text>(null)
  const [hover, setHover] = useState(false)

  const onMove = () => {
    if (textRef.current && viewport) {
      textRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
    }
  }
  useViewportMoved(onMove)

  const mouseIn = () => {
    setHover(true)
  }
  const mouseOut = () => {
    setHover(false)
  }
  const click = () => {
    session.followingPlayer = undefined
    session.lastMapInteraction = undefined
    setHover(false)
    if (viewport) zoomToPoint(new Point(x, z), viewport)
  }

  useHideOverlapping({ item: textRef, name, priority })

  return (
    <Text
      text={name}
      x={x}
      y={z}
      style={hover ? regularHover : regular}
      ref={textRef}
      anchor="0.5, 0.5"
      interactive
      cursor="pointer"
      onmouseenter={mouseIn}
      onmouseout={mouseOut}
      onclick={click}
      ontouchstart={click}
    />
  )
}
