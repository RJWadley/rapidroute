import { useEffect, useRef, useState } from "react"

import { Point } from "pixi.js"
import { Container, Text, usePixiApp } from "react-pixi-fiber"

import { session } from "utils/localUtils"

import MulticolorDot from "./MulticolorDot"
import { hideItem, showItem } from "./PixiUtils"
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
  const containerRef = useRef<Container>(null)
  const [hover, setHover] = useState(false)

  const updateSize = () => {
    if (!textRef.current || !viewport) return
    const show = viewport.scale.x > 0.1
    if (show) showItem(textRef.current, false)
    else hideItem(textRef.current)

    textRef.current.scale = new Point(
      1 / viewport.scale.x,
      1 / viewport.scale.y
    )
  }

  useViewportMoved(updateSize)
  useEffect(updateSize, [viewport, hover])

  const mouseIn = () => {
    setHover(true)
    if (textRef.current) showItem(textRef.current, false)
  }
  const mouseOut = () => {
    setHover(false)
    if (textRef.current) hideItem(textRef.current)
  }
  const onClick = () => {
    session.lastMapInteraction = undefined
    if (viewport) zoomToPoint(new Point(x, z), viewport).catch(() => {})
  }

  const app = usePixiApp()

  return (
    <Container
      interactive
      onmouseenter={mouseIn}
      onmouseout={mouseOut}
      onclick={onClick}
      cursor="pointer"
      ref={containerRef}
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
        cacheAsBitmap
      />
    </Container>
  )
}
