import { useState } from "react"

import hslToHex from "utils/hslToHex"
import invertLightness from "utils/invertLightness"

import { Marker } from "./markersType"
import MRTStop from "./MRTStop"
import { useViewport, useViewportMoved } from "./PixiViewport"

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
      {stops.map(stop => {
        return (
          <MRTStop
            key={`${stop.x}${stop.z}`}
            colors={[color, inverted]}
            x={stop.x}
            z={stop.z}
            name={stop.label}
            visible={visible}
          />
        )
      })}
    </>
  )
}
