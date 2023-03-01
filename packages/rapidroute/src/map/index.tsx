import { useEffect } from "react"

import { Stage } from "react-pixi-fiber"
import { useMeasure } from "react-use"
import styled from "styled-components"

import DynmapMarkers from "./DynmapMarkers"
import PixiViewport from "./PixiViewport"
import MapPlayers from "./Players"
import Satellite from "./Satellite"

export default function Map() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  /**
   * prevent scroll events from bubbling up to the document
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.target instanceof HTMLCanvasElement) e.preventDefault()
    }
    document.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <Wrapper ref={ref}>
      <Stage options={{ backgroundAlpha: 0, width, height }}>
        <PixiViewport width={width} height={height}>
          <Satellite />
          <DynmapMarkers />
          <MapPlayers />
        </PixiViewport>
      </Stage>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
`
