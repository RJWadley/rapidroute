import { useEffect, useState } from "react"

import { MarkersResponse, Sets, isMRTLine } from "map/markersType"
import hslToHex from "utils/hslToHex"
import invertLightness from "utils/invertLightness"
import useIsMounted from "utils/useIsMounted"

import MarkerLines from "./MarkerLines"
import MRTStops, { ColoredMarker } from "./MRTStops"

export default function DynmapMarkers() {
  const [markerSets, setMarkerSets] = useState<Sets>()

  const isMounted = useIsMounted()

  useEffect(() => {
    /* not-tanstack */ fetch(
      "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
    )
      .then(response => {
        return response.json()
      })
      .then((data: MarkersResponse) => {
        if (isMounted.current) setMarkerSets(data.sets)
      })
      .catch(console.error)
  }, [isMounted])

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
