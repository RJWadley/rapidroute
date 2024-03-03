import { getDistance } from "pathfinding/distance"
import { useState } from "react"
import type { Marker } from "types/dynmapMarkers"
import { useDeepCompareMemo } from "use-deep-compare"

import { useViewport, useViewportMoved } from "../PixiViewport"
import MRTStop from "./MRTStop"

export interface ColoredMarker {
  marker: Marker
  color: string
  invertedColor: string
}

interface Stop {
  x: number
  z: number
  markers: Marker[]
  singleColors: string[]
  combinedColors?: string[]
}

interface MRTStopsProps {
  stops: ColoredMarker[]
}

export default function MRTStops({ stops: coloredMarkers }: MRTStopsProps) {
  const [visible, setVisible] = useState(false)
  const viewport = useViewport()
  const updateMRTVisibility = () => {
    setVisible(!!(viewport && viewport.scale.x > 0.1))
  }
  useViewportMoved(updateMRTVisibility)

  const stops = useDeepCompareMemo(() => {
    const newStops: Stop[] = []

    coloredMarkers.forEach((newStop) => {
      // if the stop is within a distance of an existing stop, add it to that stop
      const maxDistance = 20
      const existingStop = newStops.find((stop) => {
        return (
          getDistance(stop.x, stop.z, newStop.marker.x, newStop.marker.z) <
          maxDistance
        )
      })
      if (existingStop) {
        existingStop.markers.push(newStop.marker)
        existingStop.x =
          existingStop.markers.reduce((sum, marker) => sum + marker.x, 0) /
          existingStop.markers.length
        existingStop.z =
          existingStop.markers.reduce((sum, marker) => sum + marker.z, 0) /
          existingStop.markers.length
        existingStop.combinedColors ||= [
          existingStop.singleColors[0] ?? "black",
        ]
        existingStop.combinedColors.push(newStop.color)
      } else {
        newStops.push({
          x: newStop.marker.x,
          z: newStop.marker.z,
          markers: [newStop.marker],
          singleColors: [newStop.color, newStop.invertedColor],
        })
      }
    })

    return newStops
  }, [coloredMarkers])

  return (
    <>
      {stops.map((stop) => {
        const { combinedColors, singleColors, markers, x, z } = stop
        return (
          <MRTStop
            key={`${x}${z}`}
            colors={combinedColors ?? singleColors}
            x={x}
            z={z}
            name={getStopName(markers)}
            visible={visible}
          />
        )
      })}
    </>
  )
}

const getStopName = (markers: Marker[]) => {
  const namedRegex = /^([\S\s]+)\((\w\w?\d*)\)$/
  const unnamedRegex = /^(\w\w?\d+) Station$/
  if (markers.every((marker) => namedRegex.test(marker.label))) {
    const stationName = markers[0]?.label.match(namedRegex)?.[1]?.trim()
    const stationCodes = markers.map(
      (marker) => marker.label.match(namedRegex)?.[2],
    )

    if (stationName && stationCodes.every(Boolean))
      return `${stationName}\n${stationCodes.join(" - ")}`
  }

  if (
    markers.length > 1 &&
    markers.every((marker) => unnamedRegex.test(marker.label))
  ) {
    const stationCodes = markers.map(
      (marker) => marker.label.match(unnamedRegex)?.[1],
    )

    if (stationCodes.every(Boolean)) return `${stationCodes.join(" - ")}`
  }

  return markers.map((marker) => marker.label).join("\n")
}
