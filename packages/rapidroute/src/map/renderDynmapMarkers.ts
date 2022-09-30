import { fabric } from "fabric"

import { isMRTLine, Markers } from "./markersType"
import renderMRTMarkers from "./renderMRTmarkers"

export default function renderDynmapMarkers(canvas: fabric.Canvas) {
  fetch(
    "https://misty-rice-7487.rjwadley.workers.dev/?https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
  )
    .then(response => {
      return response.json()
    })
    .then((data: Markers) => {
      Object.keys(data.sets).forEach(set => {
        if (isMRTLine(set)) {
          renderMRTMarkers(canvas, data.sets[set])
        }
      })

      canvas.requestRenderAll()
    })
}
