import { useEffect, useRef, useState } from "react"

import { Point } from "pixi.js"
import { Container, Text } from "react-pixi-fiber"

import { session } from "utils/localUtils"

import MulticolorDot from "./MulticolorDot"
import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular } from "./textStyles"
import { zoomToPoint } from "./zoomCamera"

interface MRTStopProps {
  name: string
  colors: string[]
  x: number
  z: number
  visible?: boolean
}

export default function MRTStop({
  name,
  colors,
  x,
  z,
  visible = true,
}: MRTStopProps) {
  const viewport = useViewport()
  const textRef = useRef<Text>(null)
  const [hover, setHover] = useState(false)

  const updateSize = () => {
    if (textRef.current && viewport) {
      textRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
    }
  }
  useViewportMoved(updateSize)
  useEffect(updateSize, [viewport, hover])

  const mouseIn = () => {
    setHover(true)
  }
  const mouseOut = () => {
    setHover(false)
  }
  const onClick = () => {
    session.lastMapInteraction = undefined
    if (viewport) zoomToPoint(new Point(x, z), viewport)
  }

  return (
    <>
      <Container
        interactive
        onmouseenter={mouseIn}
        onmouseout={mouseOut}
        onclick={onClick}
        cursor="pointer"
      >
        <MulticolorDot point={{ x, z }} colors={colors} renderable={visible} />
      </Container>
      {hover && (
        <Text
          text={name}
          x={x}
          y={z}
          style={regular}
          ref={textRef}
          anchor="0.5, 1.5"
        />
      )}
    </>
  )
}
