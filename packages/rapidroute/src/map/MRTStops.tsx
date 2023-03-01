import { useState } from "react"

import hslToHex from "utils/hslToHex"
import invertLightness from "utils/invertLightness"

import { Marker } from "./markersType"
import { useViewport, useViewportMoved } from "./PixiViewport"
import Point from "./Point"

interface MRTStopsProps {
  stops: Marker[]
  color: string
}

export default function MRTStops({ stops, color }: MRTStopsProps) {
  const inverted = hslToHex(invertLightness(color))

  const [visible, setVisible] = useState(false)
  const viewport = useViewport()

  const updateMRTVisibility = () => {
    setVisible(!!(viewport && viewport.scale.x > 0.1))
  }
  useViewportMoved(updateMRTVisibility)

  return (
    <>
      {visible &&
        stops.map(stop => {
          return (
            <Point
              key={`${stop.x}${stop.z}`}
              point={stop}
              colors={[color, inverted]}
            />
          )
        })}
    </>
  )
}
