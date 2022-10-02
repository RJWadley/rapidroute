import React, { useEffect, useRef } from "react"

import { fabric } from "fabric"
import styled from "styled-components"

import handlePinchToZoom, {
  handleTouchEnd,
  handleTouchStart,
} from "./pinchToZoom"
import renderAllObjects from "./renderAllObjects"
import renderBackground from "./renderBackground"
import renderDynmapMarkers from "./renderDynmapMarkers"
import renderPlayers from "./renderPlayers"
import setupPanAndZoom from "./setupPanAndZoom"

export default function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previousTransform = useRef<number[] | undefined>()

  useEffect(() => {
    window.isDebug = false
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        selection: false,
        imageSmoothingEnabled: false,
        skipOffscreen: true,
      })
      fabric.Object.prototype.transparentCorners = false
      canvas.setDimensions({
        width:
          canvasRef.current.parentElement?.parentElement?.offsetWidth || 100,
        height:
          canvasRef.current.parentElement?.parentElement?.offsetHeight || 100,
      })

      // start centered on 0,0 and zoomed out
      const initialZoom = 0.02
      const vpt = canvas.viewportTransform
      if (vpt) {
        vpt[4] = window.innerWidth / 2 / initialZoom
        vpt[5] = window.innerHeight / 2 / initialZoom
      }
      canvas.setZoom(initialZoom)
      if (previousTransform.current) {
        canvas.viewportTransform = previousTransform.current
      }

      canvas.requestRenderAll()
      renderAllObjects(canvas)
      setupPanAndZoom(canvas)
      renderDynmapMarkers(canvas)
      const clearPlayers = renderPlayers(canvas)

      // before render
      canvas.on("before:render", () => {
        renderBackground(canvas)
      })

      canvas.on("after:render", () => {
        if (!window.isDebug) return

        // draw a line 100px from the border of the canvas all around
        const ctx = canvas.getContext()
        if (canvas.width && canvas.height) {
          ctx.beginPath()
          ctx.moveTo(100, 100)
          ctx.lineTo(canvas.width - 100, 100)
          ctx.lineTo(canvas.width - 100, canvas.height - 100)
          ctx.lineTo(100, canvas.height - 100)
          ctx.lineTo(100, 100)
          ctx.closePath()
          ctx.lineWidth = 1
          ctx.strokeStyle = "red"
          ctx.stroke()
        }
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
        canvas.requestRenderAll()
      }

      window.addEventListener("resize", resize)
      const touchHandler = (e: TouchEvent) => handlePinchToZoom(e, canvas)
      window.addEventListener("touchmove", touchHandler)
      window.addEventListener("touchend", handleTouchEnd)
      window.addEventListener("touchstart", handleTouchStart)
      return () => {
        window.removeEventListener("resize", resize)
        window.removeEventListener("touchmove", touchHandler)
        window.removeEventListener("touchend", handleTouchEnd)
        window.removeEventListener("touchstart", handleTouchStart)
        clearPlayers()
        previousTransform.current = canvas.viewportTransform
        canvas.dispose()
      }
    }
    return () => {}
  }, [])

  return (
    <Wrapper>
      <canvas ref={canvasRef} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`
