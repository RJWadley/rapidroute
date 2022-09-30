import { fabric } from "fabric"

import { Markers } from "./markersType"
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
        switch (set) {
          case "southern":
          case "forest":
          case "arctic":
          case "northern":
          case "zephyr":
          case "mesa":
          case "plains":
          case "expo":
          case "eastern":
          case "island":
          case "taiga":
          case "savannah":
          case "lakeshore":
          case "valley":
          case "western":
          case "jungle":
          case "desert":
          case "circle":
            renderMRTMarkers(canvas, data.sets[set])
            break

          case "markers":
          case "old":
          case "airports":
          case "roads.a":
          case "roads.b":
          case "cities":
          case "worldborder.markerset":
            break

          default:
            break
        }
      })

      canvas.requestRenderAll()
    })
}
