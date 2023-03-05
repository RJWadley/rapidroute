import { useEffect, useRef, useState } from "react"

import { gsap } from "gsap"
import { Point } from "pixi.js"
import { Container, Text, usePixiApp } from "react-pixi-fiber"

import { session } from "utils/localUtils"

import useHideOverlapping from "./hideOverlapping"
import MulticolorDot from "./MulticolorDot"
import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular } from "./textStyles"
import { zoomToPoint } from "./zoomCamera"

interface MRTStopProps {
  name: string
  colors: string[]
  x: number
  z: number
}

export default function MRTStop({ name, colors, x, z }: MRTStopProps) {
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
    if (viewport) viewport.dirty = true
    if (!textRef.current) return
    setHover(true)
    gsap.to(textRef.current, { alpha: 1, duration: 0.2 })
  }
  const mouseOut = () => {
    if (viewport) viewport.dirty = true
    setHover(false)
    gsap.to(textRef.current, { alpha: 0, duration: 0.2 })
  }
  const onClick = () => {
    session.lastMapInteraction = undefined
    if (viewport) zoomToPoint(new Point(x, z), viewport).catch(() => {})
  }

  const app = usePixiApp()

  useHideOverlapping({
    item: textRef,
    name,
    priority: "hover",
    allowChange: false,
  })

  return (
    <Container
      interactive
      onmouseenter={mouseIn}
      onmouseout={mouseOut}
      onclick={onClick}
      cursor="pointer"
    >
      <MulticolorDot point={{ x, z }} colors={colors} renderer={app.renderer} />
      <Text
        text={name}
        x={x}
        y={z}
        style={regular}
        ref={textRef}
        anchor="0.5, 1.5"
        alpha={0}
        renderable={false}
        cacheAsBitmap
      />
    </Container>
  )
}
