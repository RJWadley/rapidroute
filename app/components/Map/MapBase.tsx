import { Stage } from "@pixi/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "components/Providers/QueryProvider"
import { useEffect } from "react"

import Demo from "./Demo"
import { PixiViewport } from "./PixiViewport"
import Satellite from "./Satellite/Satellite"

export default function Map() {
  const width = 1000
  const height = 500

  /**
   * prevent scroll events from bubbling up to the document
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault()
      }
    }
    document.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <div>
      <Stage width={width} height={height}>
        <QueryClientProvider client={queryClient}>
          <PixiViewport width={width} height={height}>
            <Satellite />
            <Demo />
          </PixiViewport>
        </QueryClientProvider>
      </Stage>
    </div>
  )
}
