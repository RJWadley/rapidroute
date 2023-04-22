import { Stage } from "@pixi/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "components/Providers"
import { MapSearchContext } from "components/Providers/MapSearchContext"
import { useContext, useEffect } from "react"
import { useMeasure } from "react-use"
import styled from "styled-components"
import DelayRender from "utils/DelayRender"

import AllCities from "./AllCities"
import DynmapMarkers from "./DynmapMarkers"
import Pin from "./Pin"
import PixiHooks from "./PixiHooks"
import PixiViewport from "./PixiViewport"
import MapPlayers from "./Players"
import Satellite from "./Satellite"

export default function Map() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()
  const searchContext = useContext(MapSearchContext)

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
          <MapSearchContext.Provider value={searchContext}>
            <PixiViewport width={width} height={height}>
              <PixiHooks />
              <Satellite />
              <DelayRender>
                <DynmapMarkers />
                <Pin />
                <AllCities />
                <MapPlayers />
              </DelayRender>
            </PixiViewport>
          </MapSearchContext.Provider>
        </QueryClientProvider>
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
