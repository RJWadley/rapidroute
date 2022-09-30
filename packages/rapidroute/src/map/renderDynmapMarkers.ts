import { fabric } from "fabric"

import lineIsOnScreen from "./lineIsOnScreen"
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

      canvas.requestRenderAll()
    })
}

function renderMRTMarkers(canvas: fabric.Canvas, data: MrtTypes) {
  const { lines } = data

  const allLines = Object.values(lines).map(line =>
    line.x.map((x, i) => ({ x, y: line.z[i] + 32 }))
  )
  const combinedLines = combineLines(allLines)
  const line = Object.values(lines).find(l => l.color)

  combinedLines.forEach(points => {
    canvas.on("before:render", () => {
      const ctx = canvas.getContext()

      const stroked: boolean[] = []
      const simplifyThreshold = 3

      let previousPoint: { x: number; y: number } | undefined
      // draw any line segments that are on screen
      for (let i = 0; i < points.length - 1; i += 1) {
        const p1 = points[i]
        const p2 = points[i + 1]

        if (lineIsOnScreen(p1, p2, canvas)) {
          const startPoint = fabric.util.transformPoint(
            new fabric.Point(p1.x, p1.y),
            canvas.viewportTransform || []
          )
          const endPoint = fabric.util.transformPoint(
            new fabric.Point(p2.x, p2.y),
            canvas.viewportTransform || []
          )
          ctx.beginPath()
          if (!previousPoint) previousPoint = startPoint
          ctx.moveTo(previousPoint.x, previousPoint.y)
          if (
            getDistance(startPoint, endPoint) > simplifyThreshold ||
            i === 0 ||
            i === points.length - 2
          ) {
            ctx.lineTo(endPoint.x, endPoint.y)
            previousPoint = endPoint
          }
          ctx.strokeStyle = "black"
          ctx.lineWidth = 1.5 * Math.max(5, 5 * canvas.getZoom())
          ctx.lineCap = "round"
          ctx.stroke()
          ctx.closePath()
          stroked[i] = true
        } else {
          previousPoint = undefined
        }
      }

      previousPoint = undefined
      // go through stroked segments and draw the caps
      for (let i = 0; i < points.length - 1; i += 1) {
        if (stroked[i]) {
          const p1 = points[i]
          const p2 = points[i + 1]
          const startPoint = fabric.util.transformPoint(
            new fabric.Point(p1.x, p1.y),
            canvas.viewportTransform || []
          )
          const endPoint = fabric.util.transformPoint(
            new fabric.Point(p2.x, p2.y),
            canvas.viewportTransform || []
          )
          ctx.beginPath()
          if (!previousPoint) previousPoint = startPoint
          ctx.moveTo(previousPoint.x, previousPoint.y)
          if (
            getDistance(startPoint, endPoint) > simplifyThreshold ||
            i === 0 ||
            i === points.length - 2
          ) {
            ctx.lineTo(endPoint.x, endPoint.y)
            previousPoint = endPoint
          }
          ctx.strokeStyle = line?.color || "orange"
          ctx.lineWidth = Math.max(5, 5 * canvas.getZoom())
          ctx.stroke()
        } else {
          previousPoint = undefined
        }
      }
    })

    const { markers } = data

    Object.values(markers).forEach(marker => {
      const { x, z } = marker

      canvas.on("before:render", () => {
        const ctx = canvas.getContext()
        const radius = 10 * canvas.getZoom()
        const lineColor = Object.values(lines)[0].color

        if (canvas.getZoom() < 0.1) return

        // draw a point at the marker location
        if (lineIsOnScreen({ x, y: z + 32 }, { x, y: z + 32 }, canvas)) {
          const point = fabric.util.transformPoint(
            new fabric.Point(x, z + 32),
            canvas.viewportTransform || []
          )
          ctx.beginPath()
          ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false)
          ctx.strokeStyle = lineColor
          ctx.lineWidth = 5 * canvas.getZoom()
          ctx.fillStyle = "white"
          ctx.fill()
          ctx.stroke()
        }
      })
    })
  })
}

const combineLines = (
  linesRaw: { x: number; y: number }[][]
): { x: number; y: number }[][] => {
  let lines = linesRaw

  // if any two lines share a point, combine them
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const lineA = lines[i]
      const lineB = lines[j]
      const startA = lineA[0]
      const endA = lineA[lineA.length - 1]
      const startB = lineB[0]
      const endB = lineB[lineB.length - 1]

      // either A point is within 50 units of either B point
      const within50 = (
        a: { x: number; y: number },
        b: { x: number; y: number }
      ) => {
        const xDiff = Math.abs(a.x - b.x)
        const yDiff = Math.abs(a.y - b.y)
        return xDiff < 50 && yDiff < 50
      }

      let combined: { x: number; y: number }[] | null = null
      if (within50(startA, startB)) {
        const cloneA = [...lineA]
        cloneA.reverse()
        combined = [...cloneA, ...lineB]
      }
      if (within50(startA, endB)) {
        combined = [...lineB, ...lineA]
      }
      if (within50(endA, startB)) {
        combined = [...lineA, ...lineB]
      }
      if (within50(endA, endB)) {
        const cloneB = [...lineB]
        cloneB.reverse()
        combined = [...lineA, ...cloneB]
      }

      if (combined) {
        lines = lines.filter(line => line !== lineA)
        lines = lines.filter(line => line !== lineB)
        lines.push(combined)
        return combineLines(lines)
      }
    }
  }

  return lines
}

const getDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) => {
  const xDiff = p1.x - p2.x
  const yDiff = p1.y - p2.y
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}
