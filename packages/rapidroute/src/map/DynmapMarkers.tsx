import { useEffect, useState } from "react"

import { MarkersResponse, Sets, isMRTLine } from "map/markersType"

import MarkerLines from "./MarkerLines"
import MRTStops from "./MRTStops"

export default function DynmapMarkers() {
  const [markerSets, setMarkerSets] = useState<Sets>()

  useEffect(() => {
    fetch(
      "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
    )
      .then(response => {
        return response.json()
      })
      .then((data: MarkersResponse) => {
        setMarkerSets(data.sets)
      })
      .catch(console.error)
  }, [])

  if (!markerSets) return null
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
      {Object.keys(markerSets).map(name => {
        if (isMRTLine(name)) {
          const lineColor = Object.values(markerSets[name].lines)[0]?.color
          return (
            <MRTStops
              color={lineColor ?? "#000000"}
              key={name}
              stops={Object.values(markerSets[name].markers)}
            />
          )
        }
        return null
      })}
    </>
  )
}
