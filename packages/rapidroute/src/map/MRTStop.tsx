import { useContext, useRef, useState } from "react"

import { Container, Text, useApp } from "@pixi/react"
import { Point, Container as PixiContainer, Text as PixiText } from "pixi.js"

import { MapSearchContext } from "components/Providers/MapSearchContext"
import { clearLocal } from "utils/localUtils"

import MulticolorDot from "./MulticolorDot"
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
  const textRef = useRef<PixiText>(null)
  const containerRef = useRef<PixiContainer>(null)
  const [hover, setHover] = useState(false)
  const { activeItem, setActiveItem } = useContext(MapSearchContext)

  const updateSize = () => {
    if (textRef.current && viewport)
      textRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
  }

  const pointerIn = () => {
    setHover(true)
    setTimeout(updateSize)
    window.addEventListener("wheel", updateSize)
  }
  const pointerOut = () => {
    setHover(false)
    window.removeEventListener("wheel", updateSize)
  }
  const onClick = () => {
    clearLocal("lastMapInteraction")
    setActiveItem(name.match(/(\w\w?\d+)/)?.[1] ?? "")
    if (viewport) zoomToPoint(new Point(x, z), viewport).catch(() => {})
  }

  const app = useApp()

  const updateOpacityWhenClose = () => {
    if (viewport && containerRef.current) {
      const zoom = viewport.scale.x

      const opacity = Math.max(0, Math.min(1, 1 - (zoom - 2.75)))
      containerRef.current.alpha = opacity
    }
  }
  useViewportMoved(updateOpacityWhenClose)

  const isActiveItem =
    activeItem &&
    // we need to avoid matching subsets like WN4 and WN46
    // active id comes at the very end of the string
    (name.endsWith(activeItem) ||
      // or it comes earlier in the string
      name.includes(`${activeItem} `))

  const verticalSpacing = name.includes("\n") ? 2 : 3

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
      {hover && (
        <Text
          text={name}
          x={x}
          y={z}
          style={regular}
          ref={textRef}
          anchor={isActiveItem ? [0.5, verticalSpacing] : [0.5, 1.5]}
        />
      )}
    </Container>
  )
}
