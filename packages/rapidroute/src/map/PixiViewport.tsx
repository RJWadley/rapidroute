import { createContext, useContext, useEffect, useRef, useState } from "react"

import { Viewport } from "pixi-viewport"
import { CustomPIXIComponent } from "react-pixi-fiber"

type ViewportProps = {
  setViewport: (viewport: Viewport) => void
  width: number
  height: number
}

export const worldSize = 61000

const DisplayObjectViewport = CustomPIXIComponent(
  {
    customDisplayObject: ({ setViewport, width, height }: ViewportProps) => {
      const halfSize = worldSize / 2
      const viewport = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldHeight: halfSize,
        worldWidth: halfSize,
      })
      viewport.drag().pinch().wheel().decelerate()
      setViewport(viewport)
      return viewport
    },
    customApplyProps: (instance, oldProps, newProps) => {
      if (instance instanceof Viewport) {
        instance.resize(newProps.width, newProps.height)
      }
    },
  },
  "Viewport"
)

const ViewportContext = createContext<Viewport | null>(null)

export const useViewport = () => {
  const viewport = useContext(ViewportContext)
  return viewport
}

/**
 * run a function when the viewport is moved
 * @param callback the callback to be called when the viewport is moved
 */
export const useViewportMoved = (callback: () => void) => {
  const viewport = useViewport()

  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  })

  const onMoved = () => {
    if (viewport && isMounted.current) {
      callback()
    }
  }

  // for the first five seconds, run the callback every 100ms
  // this is to ensure that the viewport is fully initialized
  useEffect(() => {
    const startupInterval = setInterval(onMoved, 100)
    setTimeout(() => {
      clearInterval(startupInterval)
    }, 2000)

    return () => {
      clearInterval(startupInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport])

  useEffect(() => {
    viewport?.addEventListener("moved", onMoved)
    return () => viewport?.removeEventListener("moved", onMoved)
  })
}

export default function PixiViewport({
  children,
  width,
  height,
}: {
  children: React.ReactNode
  width: number
  height: number
}) {
  const [viewport, setViewport] = useState<Viewport | null>(null)

  /**
   * on initial mount, move the center of the viewport to 0, 0
   */
  useEffect(() => {
    if (viewport) {
      setTimeout(() => {
        viewport
          .moveCenter(0, 0)
          .setZoom(0.5)
          .clampZoom({
            maxHeight: worldSize * 2,
            maxWidth: worldSize * 2,
            minHeight: 100,
            minWidth: 100,
          })
          .clamp({
            top: -worldSize,
            left: -worldSize,
            bottom: worldSize,
            right: worldSize,
            underflow: "none",
          })
      }, 100)
    }
  }, [viewport])

  return (
    <DisplayObjectViewport
      setViewport={setViewport}
      width={width}
      height={height}
    >
      <ViewportContext.Provider value={viewport}>
        {children}
      </ViewportContext.Provider>
    </DisplayObjectViewport>
  )
}
