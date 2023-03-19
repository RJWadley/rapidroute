import { useQuery } from "@tanstack/react-query"

import { MarkersResponse, isMRTLine } from "map/markersType"
import hslToHex from "utils/hslToHex"
import invertLightness from "utils/invertLightness"

import MarkerLines from "./MarkerLines"
import MRTStops, { ColoredMarker } from "./MRTStops"

export default function DynmapMarkers() {
  const { data } = useQuery<MarkersResponse>({
    queryKey: [
      "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json",
    ],
  })

  const markerSets = data?.sets
  if (!markerSets) return null

  const allStops: ColoredMarker[] = Object.keys(markerSets).flatMap(name => {
    if (isMRTLine(name)) {
      return Object.values(markerSets[name].markers).map(marker => {
        const color = Object.values(markerSets[name].lines)[0]?.color
        const invertedColor = hslToHex(invertLightness(color))
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
      {Object.keys(markerSets).map(name => {
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
