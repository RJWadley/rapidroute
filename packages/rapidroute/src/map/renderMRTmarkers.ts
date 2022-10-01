/* eslint-disable max-lines */
import { fabric } from "fabric"

import invertLightness from "utils/invertLightness"

import lineIsOnScreen from "./lineIsOnScreen"
import { MrtTypes } from "./markersType"

export default function renderMRTMarkers(
  canvas: fabric.Canvas,
  data: MrtTypes
) {
  const { lines } = data

  const allLines = Object.values(lines).map(line =>
    line.x.map((x, i) => ({ x, y: line.z[i] + 32 }))
  )
  const combinedLines = combineLines(allLines)
  const line = Object.values(lines).find(l => l.color)

  combinedLines.forEach(points => {
    canvas.on("before:render", () => {
      drawLine(canvas, points, "black", 1.5)
      drawLine(canvas, points, line?.color, 1)
    })
  })

  const { markers } = data
  const markerList = Object.values(markers)

  markerList.forEach(marker => {
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
        ctx.fillStyle = invertLightness(lineColor)
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 5 * canvas.getZoom()
        ctx.fill()
        ctx.stroke()
      }
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

const drawLine = (
  canvas: fabric.Canvas,
  points: { x: number; y: number }[],
  color?: string,
  width = 1
) => {
  let previousPoint: { x: number; y: number } | undefined
  const simplifyThreshold = 4
  const importantLineThreshold = 10
  const ctx = canvas.getContext()
  // draw any line segments that are on screen
  ctx.beginPath()
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
      if (!previousPoint) previousPoint = startPoint
      ctx.moveTo(previousPoint.x, previousPoint.y)
      if (
        previousPoint !== startPoint &&
        getDistance(startPoint, endPoint) > importantLineThreshold
      ) {
        ctx.lineTo(startPoint.x, startPoint.y)
      }
      if (
        getDistance(previousPoint, endPoint) > simplifyThreshold ||
        i === 0 ||
        i === points.length - 2
      ) {
        ctx.lineTo(endPoint.x, endPoint.y)
        previousPoint = endPoint
      }
      ctx.strokeStyle = color || "black"
      ctx.lineWidth = width * Math.max(5, 5 * canvas.getZoom())
      ctx.lineCap = "round"
    } else {
      previousPoint = undefined
    }
  }
  ctx.stroke()
  ctx.closePath()
}
