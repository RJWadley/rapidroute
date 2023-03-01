import hslToHex from "utils/hslToHex"
import invertLightness from "utils/invertLightness"

import { Marker } from "./markersType"
import Point from "./Point"

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
          <Point
            key={`${stop.x}${stop.z}`}
            point={stop}
            colors={[color, inverted]}
            visible={false}
          />
        )
      })}
    </>
  )
}
