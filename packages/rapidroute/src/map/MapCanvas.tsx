import React, { useEffect, useRef } from "react"

import { fabric } from "fabric"

import handlePinchToZoom, {
  handleTouchEnd,
  handleTouchStart,
} from "./pinchToZoom"
import renderAllObjects from "./renderAllObjects"
import renderBackground from "./renderBackground"
import setupPanAndZoom from "./setupPanAndZoom"

export default function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        selection: false,
      })
      fabric.Object.prototype.transparentCorners = false
      canvas.setDimensions({
        width:
          canvasRef.current.parentElement?.parentElement?.offsetWidth || 100,
        height:
          canvasRef.current.parentElement?.parentElement?.offsetHeight || 100,
      })
      canvas.renderAll()
      renderAllObjects(canvas)
      setupPanAndZoom(canvas)

      // before render
      canvas.on("before:render", () => {
        renderBackground(canvas)
      })

      // resize
      const resize = () => {
        if (canvasRef.current)
          canvas.setDimensions({
            width:
              canvasRef.current.parentElement?.parentElement?.offsetWidth ||
              100,
            height:
              canvasRef.current.parentElement?.parentElement?.offsetHeight ||
              100,
          })
        canvas.renderAll()
      }

      window.addEventListener("resize", resize)
      const touchHandler = (e: TouchEvent) => handlePinchToZoom(e, canvas)
      window.addEventListener("touchmove", touchHandler)
      window.addEventListener("touchend", handleTouchEnd)
      window.addEventListener("touchstart", handleTouchStart)
      return () => {
        canvas.dispose()
        window.removeEventListener("resize", resize)
        window.removeEventListener("touchmove", touchHandler)
        window.removeEventListener("touchend", handleTouchEnd)
        window.removeEventListener("touchstart", handleTouchStart)
      }
    }
    return () => {}
  }, [])

  return <canvas ref={canvasRef} />
}
