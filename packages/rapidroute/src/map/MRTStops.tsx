import hslToHex from "utils/hslToHex"
import invertLightness from "utils/invertLightness"

import { Marker } from "./markersType"
import MRTStop from "./MRTStop"

interface MRTStopsProps {
  stops: Marker[]
  color: string
}

export default function MRTStops({ stops, color }: MRTStopsProps) {
  const inverted = hslToHex(invertLightness(color))

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
          />
        )
      })}
    </>
  )
}
