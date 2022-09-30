import { fabric } from "fabric"

// canvas.on({
//   "object:selected": function () {
//     pausePanning = true
//   },
//   "selection:cleared": function () {
//     pausePanning = false
//   },
//   "touch:drag": function (e) {
//     if (
//       pausePanning == false &&
//       undefined != e.e.layerX &&
//       undefined != e.e.layerY
//     ) {
//       currentX = e.e.layerX
//       currentY = e.e.layerY
//       xChange = currentX - lastX
//       yChange = currentY - lastY

//       if (
//         Math.abs(currentX - lastX) <= 50 &&
//         Math.abs(currentY - lastY) <= 50
//       ) {
//         const delta = new fabric.Point(xChange, yChange)
//         canvas.relativePan(delta)
//       }

//       lastX = e.e.layerX
//       lastY = e.e.layerY
//     }
//   },
// })
let lastDistance = 0
const last10dz: number[] = []
let dz = 0
let lastX = 0
let lastY = 0
export default function handlePinchToZoom(
  e: TouchEvent,
  canvas: fabric.Canvas
) {
  if (canvas.getActiveObject()) return
  const { touches } = e
  if (touches.length === 2) {
    const touch1 = touches[0]
    const touch2 = touches[1]
    const x1 = touch1.clientX
    const y1 = touch1.clientY
    const x2 = touch2.clientX
    const y2 = touch2.clientY
    const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    if (lastDistance) {
      const delta = distance - lastDistance
      const zoom = canvas.getZoom()
      const newZoom = zoom + (delta / 1000) * zoom
      canvas.zoomToPoint(
        { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
        Math.min(10, Math.max(0.01, newZoom))
      )
      last10dz.push(delta)
      if (last10dz.length > 10) {
        last10dz.shift()
      }
      lastX = (x1 + x2) / 2
      lastY = (y1 + y2) / 2

      // set coords on all objects
      canvas.getObjects().forEach(obj => {
        obj.setCoords()
      })
    }
    lastDistance = distance
  }

  //   maintain zoom inertia when fingers are lifted
  canvas.on("before:render", () => {
    if (last10dz) {
      if (Number.isNaN(dz)) dz = 0

      const zoom = canvas.getZoom()
      const newZoom = zoom + (dz / 10000) * zoom
      canvas.zoomToPoint(
        { x: lastX, y: lastY },
        Math.min(10, Math.max(0.01, newZoom))
      )
      dz *= 0.997
      if (Math.abs(dz) > 0.1) {
        // set coords on all objects
        canvas.getObjects().forEach(obj => {
          obj.setCoords()
        })
        canvas.requestRenderAll()
      }
    }
  })
}

export function handleTouchEnd() {
  dz = last10dz.reduce((a, b) => a + b, 0) / (last10dz.length * 10)
  lastDistance = 0
}

export function handleTouchStart() {
  last10dz.length = 0
}
