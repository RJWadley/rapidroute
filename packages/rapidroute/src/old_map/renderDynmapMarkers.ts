import { fabric } from "fabric"

import { isMRTLine, Marker, Markers } from "./markersType"
import renderMRTMarkers, {
  renderDuplicateStops,
  renderStops,
} from "./renderMRTmarkers"

export default function renderDynmapMarkers(canvas: fabric.Canvas) {
  let isActive = true

  fetch(
    "https://cors.mrtrapidroute.com/?https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
  )
    .then(response => {
      return response.json()
    })
    .then((data: Markers) => {
      if (!isActive) return
      const allMRTStops = Object.keys(data.sets).flatMap(set => {
        if (isMRTLine(set)) {
          return Object.values(data.sets[set].markers)
        }
        return []
      })

      const stopsDuped: Marker[] = []
      const duplicateStops: Marker[][] = allMRTStops.flatMap(stop => {
        if (stopsDuped.includes(stop)) return []

        const filtered = allMRTStops.filter(otherStop => {
          const xDiff = stop.x - otherStop.x
          const zDiff = stop.z - otherStop.z
          return (
            Math.sqrt(xDiff * xDiff + zDiff * zDiff) < 10 &&
            stop.label !== otherStop.label
          )
        })

        stopsDuped.push(...filtered)
        return filtered.length > 0 ? [[stop, ...filtered]] : []
      })

      const uniqueStops = allMRTStops.filter(stop => {
        return !duplicateStops.some(duplicateStop => {
          return duplicateStop.some(duplicate => {
            return duplicate.label === stop.label
          })
        })
      })

      const lineColors: Record<string, string> = {}

      Object.keys(data.sets).forEach(set => {
        if (isMRTLine(set)) {
          const line = data.sets[set]
          renderMRTMarkers(canvas, line)
          const { color } = Object.values(line.lines)[0]
          lineColors[Object.values(line.markers)[0].icon] = color
          renderStops(
            canvas,
            Object.values(line.markers).filter(stop =>
              uniqueStops.some(uniqueStop => uniqueStop.label === stop.label)
            ),
            color
          )
        }
      })

      renderDuplicateStops(canvas, duplicateStops, lineColors)

      canvas.requestRenderAll()
    })
    .catch(err => {
      console.error("error fetching dynmap markers", err)
    })

  return () => {
    isActive = false
  }
}
