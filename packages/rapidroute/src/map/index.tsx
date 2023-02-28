import { Stage } from "react-pixi-fiber"
import { useMeasure } from "react-use"
import styled from "styled-components"

import DynmapMarkers from "./DynmapMarkers"
import PixiViewport from "./PixiViewport"
import MapPlayers from "./Players"
import Satellite from "./Satellite"

export default function Map() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

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
