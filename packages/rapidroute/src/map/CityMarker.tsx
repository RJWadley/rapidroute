import { useRef } from "react"

import { Point } from "pixi.js"
import { Container, Text } from "react-pixi-fiber"

import { session } from "utils/localUtils"

import { hideItem, showItem } from "./PixiUtils"
import { useViewport, useViewportMoved } from "./PixiViewport"
import { regular, regularHover } from "./textStyles"
import useHideOverlapping from "./useHideOverlapping"
import { zoomToPoint } from "./zoomCamera"

type CityType =
  | "Unranked"
  | "Community"
  | "Councillor"
  | "Mayor"
  | "Senator"
  | "Governor"
  | "Premier"
  | "spawn"

const min = 0.015
const max = 0.25
const ZoomThresholds: Partial<Record<CityType, number>> = {
  spawn: min,
  Premier: min,
  Governor: 0.035,
  Community: 0.05,
  Senator: 0.1,
  Mayor: 0.15,
  Councillor: 0.2,
}

interface CityMarkerProps {
  name: string
  x: number
  z: number
  type: CityType
}

export default function CityMarker({ name, x, z, type }: CityMarkerProps) {
  const viewport = useViewport()
  const containerRef = useRef<Container>(null)
  const hoverTextRef = useRef<Text>(null)

  const onMove = () => {
    if (containerRef.current && viewport) {
      containerRef.current.scale = new Point(
        1 / viewport.scale.x,
        1 / viewport.scale.y
      )
    }
  }
  useViewportMoved(onMove)

  const pointerIn = () => {
    if (hoverTextRef.current) showItem(hoverTextRef.current, "auto")
  }
  const pointerOut = () => {
    if (hoverTextRef.current) hideItem(hoverTextRef.current)
  }
  const click = () => {
    session.followingPlayer = undefined
    session.lastMapInteraction = undefined
    if (viewport) zoomToPoint(new Point(x, z), viewport).catch(() => {})
  }

  useHideOverlapping({
    item: containerRef,
    name,
    priority: type,
    minZoom: ZoomThresholds[type] ?? max,
  })

  return (
    <Container
      x={x}
      y={z}
      ref={containerRef}
      cursor="pointer"
      onpointerenter={pointerIn}
      onpointerout={pointerOut}
      onclick={click}
      ontouchstart={pointerIn}
      ontouchend={() => {
        pointerOut()
        click()
      }}
      renderable={false}
    >
      <Text text={name} style={regular} anchor="0.5, 0.5" />
      <Text
        text={name}
        style={regularHover}
        anchor="0.5, 0.5"
        ref={hoverTextRef}
        renderable={false}
      />
    </Container>
  )
}
