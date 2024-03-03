import { useQuery } from "@tanstack/react-query"
import { isMRTLine, type MarkersResponse } from "types/dynmapMarkers"
import invertLightness from "utils/colors/invertLightness"

import MarkerLines from "./MarkerLines"
import type { ColoredMarker } from "./MRTStops"
import MRTStops from "./MRTStops"

export default function DynmapMarkers() {
  const { data } = useQuery<MarkersResponse>({
    queryKey: [
      "https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
    ],
  })

  console.log(data)

  const markerSets = data?.sets
  if (!markerSets) return null

  const allStops: ColoredMarker[] = Object.keys(markerSets).flatMap((name) => {
    if (isMRTLine(name)) {
      return Object.values(markerSets[name].markers).map((marker) => {
        const color = Object.values(markerSets[name].lines)[0]?.color ?? "black"
        const invertedColor = invertLightness(color)
        return {
          marker,
          color,
          invertedColor,
        }
      })
    }
    return []
  })

  return (
    <>
      {Object.keys(markerSets).map((name) => {
        if (isMRTLine(name))
          return (
            <MarkerLines
              key={name}
              lines={Object.values(markerSets[name].lines)}
            />
          )
        return null
      })}
      <MRTStops stops={allStops} />
    </>
  )
}
