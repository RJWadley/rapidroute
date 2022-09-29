import React, { useEffect, useRef } from "react"

import { fabric } from "fabric"

export default function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current)
      canvas.setDimensions({ width: 500, height: 500 })
      canvas.setBackgroundColor("red", () => {})
      canvas.renderAll()

      // add a rectangle
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: "green",
        width: 50,
        height: 50,
      })
    }
  })

  return (
    <div>
      <h1>MapCanvas</h1>
      <canvas ref={canvasRef} />
    </div>
  )
}
