import { useRef } from "react"

import { Container } from "@pixi/react"
import { Container as PixiContainer } from "pixi.js"

import Line from "./Line"
import { LineType } from "./markersType"
import { hideItem, showItem } from "./PixiUtils"
import { useViewport, useViewportMoved } from "./PixiViewport"

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
      {lines.map(line => (
        <MarkerLine key={JSON.stringify(line)} line={line} background />
      ))}
      {lines.map(line => (
        <MarkerLine key={JSON.stringify(line)} line={line} />
      ))}
    </Container>
  )
}
