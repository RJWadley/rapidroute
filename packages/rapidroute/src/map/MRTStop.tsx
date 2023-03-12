import { useRef } from "react"

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
  visible: boolean
}

export default function MRTStop({ name, colors, x, z, visible }: MRTStopProps) {
  const viewport = useViewport()
  const textRef = useRef<Text>(null)
  const containerRef = useRef<Container>(null)

  const updateSize = () => {
    if (textRef.current && viewport)
      textRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
  }

  const pointerIn = () => {
    updateSize()
    if (textRef.current) showItem(textRef.current, "auto")
    window.addEventListener("wheel", updateSize)
  }
  const pointerOut = () => {
    updateSize()
    if (textRef.current) hideItem(textRef.current)
    window.removeEventListener("wheel", updateSize)
  }
  const onClick = () => {
    session.lastMapInteraction = undefined
    if (viewport) zoomToPoint(new Point(x, z), viewport).catch(() => {})
  }

  const app = usePixiApp()

  const updateOpacityWhenClose = () => {
    if (viewport && containerRef.current) {
      const zoom = viewport.scale.x

      const opacity = Math.max(0, Math.min(1, 1 - (zoom - 2.75)))
      containerRef.current.alpha = opacity
    }
  }
  useViewportMoved(updateOpacityWhenClose)

  return (
    <Container
      eventMode="static"
      onpointerenter={pointerIn}
      onpointerout={pointerOut}
      onclick={onClick}
      ontouchstart={pointerIn}
      ontouchend={() => {
        pointerOut()
        onClick()
      }}
      cursor="pointer"
      renderable={visible}
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
        renderable={false}
      />
    </Container>
  )
}
