import { createContext, useContext, useState } from "react"

import { Viewport } from "pixi-viewport"
import { CustomPIXIComponent } from "react-pixi-fiber"

type ViewportProps = {
  setViewport: (viewport: Viewport) => void
  width: number
  height: number
}

const DisplayObjectViewport = CustomPIXIComponent(
  {
    customDisplayObject: ({ setViewport, width, height }: ViewportProps) => {
      const viewport = new Viewport({
        screenWidth: width,
        screenHeight: height,
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
