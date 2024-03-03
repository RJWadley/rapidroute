"use client"
import { styled } from "@linaria/react"
import { Stage } from "@pixi/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "components/Providers/QueryProvider"
import { useEffect } from "react"
import useMeasure from "react-use-measure"

import Demo from "./Demo"
import DynmapMarkers from "./Dynmap/DynmapMarkers"
import { PixiViewport } from "./PixiViewport"
import Satellite from "./Satellite"

export default function Map() {
  const [ref, bounds] = useMeasure()
  const { width, height } = bounds

  /**
   * prevent scroll events from bubbling up to the document
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault()
      }
    }
    document.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <Wrapper ref={ref}>
      <Stage width={width} height={height}>
        <QueryClientProvider client={queryClient}>
          <PixiViewport width={width} height={height}>
            <Satellite />
            <DynmapMarkers />
            <Demo />
          </PixiViewport>
        </QueryClientProvider>
      </Stage>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 800px;

  canvas {
    position: absolute;
    inset: 0;
  }
`
