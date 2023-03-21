import { createContext, useContext, useEffect, useRef, useState } from "react"

import { PixiComponent, useApp } from "@pixi/react"
import { Viewport } from "pixi-viewport"
import { EventSystem } from "pixi.js"

import { clearLocal, getLocal, setLocal } from "utils/localUtils"

type ViewportProps = {
  setViewport: (viewport: Viewport) => void
  width: number
  height: number
  events: EventSystem
  children: React.ReactNode
}

export const worldSize = 61000

const DisplayObjectViewport = PixiComponent("Viewport", {
  create: ({ setViewport, width, height, events }: ViewportProps) => {
    const halfSize = worldSize / 2
    const viewport = new Viewport({
      screenWidth: width,
      screenHeight: height,
      worldHeight: halfSize,
      worldWidth: halfSize,
      events,
    })
    viewport.drag().pinch().wheel().decelerate()

    setViewport(viewport)
    return viewport
  },
  applyProps: (instance, _, newProps) => {
    if (instance instanceof Viewport) {
      instance.resize(newProps.width, newProps.height)
    }
  },
})

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
  const firstRender = useRef(true)

  // for the first five seconds, run the callback every 100ms
  // this is to ensure that the viewport is fully initialized
  useEffect(() => {
    let isMounted = true
    const onViewportMoved = () => {
      if (isMounted && viewport && !viewport.destroyed) {
        callback()
      }
    }

    const startupInterval =
      firstRender.current && setInterval(onViewportMoved, 100)
    setTimeout(() => {
      if (startupInterval) clearInterval(startupInterval)
    }, 2000)

    viewport?.addEventListener("moved", onViewportMoved)
    moveCallbacks.push(onViewportMoved)
    return () => {
      isMounted = false
      viewport?.removeEventListener("moved", onViewportMoved)
      moveCallbacks = moveCallbacks.filter(cb => cb !== onViewportMoved)
    }
    // we only want to run this on the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport])
}

/**
 * trigger the movement callbacks manually
 */
export const triggerMovementManually = () => {
  moveCallbacks.forEach(cb => cb())
}

export const canMoveViewport = () => {
  const lastInteraction = getLocal("lastMapInteraction")
  if (lastInteraction) {
    const now = new Date()
    const diff = now.getTime() - lastInteraction.getTime()
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

  const app = useApp()

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
      setLocal("lastMapInteraction", new Date())
      clearLocal("followingPlayer")
    }
    viewport?.addEventListener("touchmove", onMoved)
    viewport?.addEventListener("pointerdown", onMoved)
    viewport?.addEventListener("wheel", onMoved)
    return () => {
      viewport?.removeEventListener("touchmove", onMoved)
      viewport?.removeEventListener("pointerdown", onMoved)
      viewport?.removeEventListener("wheel", onMoved)
    }
  }, [viewport])

  return (
    <ViewportContext.Provider value={viewport}>
      <DisplayObjectViewport
        setViewport={setViewport}
        width={width}
        height={height}
        events={app.renderer.events}
      >
        {children}
      </DisplayObjectViewport>
    </ViewportContext.Provider>
  )
}
