import { fabric } from "fabric"

import { Markers, MrtTypes } from "./markersType"

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
    })
}

function renderMRTMarkers(canvas: fabric.Canvas, data: MrtTypes) {
  const { lines } = data

  Object.values(lines).forEach(line => {
    const { x, z } = line

    const points = x.map((x2, i) => {
      return { x: x2, y: z[i] }
    })

    const polyline = new fabric.Polyline(points, {
      fill: "transparent",
      stroke: "red",
      selectable: false,
      evented: false,
      
    })

    canvas.on("mouse:wheel", () => {
      polyline.set({
        // stroke of 10px regardless of zoom
        strokeWidth: 10 / canvas.getZoom(),
      })
    })
    canvas.on("mouse:move", () => {
      polyline.set({
        // stroke of 10px regardless of zoom
        strokeWidth: 10 / canvas.getZoom(),
      })
    })

    canvas.add(polyline)
  })
}
