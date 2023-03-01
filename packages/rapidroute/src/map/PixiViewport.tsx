import { createContext, useContext, useEffect, useRef, useState } from "react"

import { Simple } from "pixi-cull"
import { Viewport } from "pixi-viewport"
import { EventSystem, Ticker } from "pixi.js"
import { CustomPIXIComponent, usePixiApp } from "react-pixi-fiber"

import { session } from "utils/localUtils"

type ViewportProps = {
  setViewport: (viewport: Viewport) => void
  width: number
  height: number
  events: EventSystem
}

export const worldSize = 61000

const DisplayObjectViewport = CustomPIXIComponent(
  {
    customDisplayObject: ({
      setViewport,
      width,
      height,
      events,
    }: ViewportProps) => {
      const halfSize = worldSize / 2
      const viewport = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldHeight: halfSize,
        worldWidth: halfSize,
        events,
      })
      viewport.drag().pinch().wheel().decelerate()

      const cull = new Simple()
      cull.addList(viewport.children)
      cull.cull(viewport.getVisibleBounds())

      // cull whenever the viewport moves
      Ticker.shared.add(() => {
        if (viewport.dirty) {
          cull.cull(viewport.getVisibleBounds())
          viewport.dirty = false
        }
      })

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

let moveCallbacks: (() => void)[] = []
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
    moveCallbacks.push(onMoved)
    return () => {
      viewport?.removeEventListener("moved", onMoved)
      moveCallbacks = moveCallbacks.filter(cb => cb !== onMoved)
    }
  })
}

/**
 * trigger the movement callbacks manually
 */
export const triggerMovementManually = () => {
  moveCallbacks.forEach(cb => cb())
}

export const canMoveViewport = () => {
  if (session.lastMapInteraction) {
    const now = new Date()
    const diff = now.getTime() - session.lastMapInteraction.getTime()
    if (diff < 10000) return false
  }
  return true
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

  const app = usePixiApp()

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

  /**
   * track time since last viewport move
   */
  useEffect(() => {
    const onMoved = () => {
      session.lastMapInteraction = new Date()
    }
    viewport?.addEventListener("touchmove", onMoved)
    viewport?.addEventListener("mousedown", onMoved)
    viewport?.addEventListener("wheel", onMoved)
    return () => {
      viewport?.removeEventListener("touchmove", onMoved)
      viewport?.removeEventListener("mousedown", onMoved)
      viewport?.removeEventListener("wheel", onMoved)
    }
  }, [viewport])

  return (
    <DisplayObjectViewport
      setViewport={setViewport}
      width={width}
      height={height}
      events={app.renderer.events}
    >
      <ViewportContext.Provider value={viewport}>
        {children}
      </ViewportContext.Provider>
    </DisplayObjectViewport>
  )
}
