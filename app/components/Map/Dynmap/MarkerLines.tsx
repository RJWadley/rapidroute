import { Container } from "@pixi/react"
import type { Container as PixiContainer } from "pixi.js"
import { useRef } from "react"
import type { LineType } from "types/dynmapMarkers"

import { hideItem, showItem } from "../pixiUtils"
import { useViewport, useViewportMoved } from "../PixiViewport"
import Line from "./Line"

interface MarkerLinesProps {
  lines: LineType[]
}

function MarkerLine({
  line,
  background = false,
}: {
  line: LineType
  background?: boolean
}) {
  const points = line.x.map((x, i) => ({
    x,
    z: line.z[i] ?? 0,
  }))

  return <Line points={points} color={line.color} background={background} />
}

export default function MarkerLines({ lines }: MarkerLinesProps) {
  const containerRef = useRef<PixiContainer>(null)
  const viewport = useViewport()

  const updateOpacityWhenClose = () => {
    if (viewport && containerRef.current) {
      const zoom = viewport.scale.x

      const opacity = Math.max(0, Math.min(1, 1 - (zoom - 2)))
      containerRef.current.alpha = opacity
      if (opacity === 0) hideItem(containerRef.current)
      else showItem(containerRef.current)
    }
  }
  useViewportMoved(updateOpacityWhenClose)

  return (
    <Container ref={containerRef}>
      {lines.map((line) => (
        <MarkerLine key={JSON.stringify(line)} line={line} background />
      ))}
      {lines.map((line) => (
        <MarkerLine key={JSON.stringify(line)} line={line} />
      ))}
    </Container>
  )
}
