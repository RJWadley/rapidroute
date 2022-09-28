import React, { createContext, ReactNode, useMemo, useState } from "react"

import { SegmentType } from "components/createSegments"

export const NavigationContext = createContext<{
  prefferedRoute: string[]
  setPrefferedRoute: (prefferedRoute: string[]) => void
  currentRoute: SegmentType[]
  setCurrentRoute: (currentRoute: SegmentType[]) => void
}>({
  prefferedRoute: [],
  setPrefferedRoute: () => {},
  currentRoute: [],
  setCurrentRoute: () => {},
})

export function NavigationProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [prefferedRoute, setPrefferedRoute] = useState<string[]>([])
  const [currentRoute, setCurrentRoute] = useState<SegmentType[]>([])

  const value = useMemo(() => {
    return {
      prefferedRoute,
      setPrefferedRoute,
      currentRoute,
      setCurrentRoute,
    }
  }, [currentRoute, prefferedRoute])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}
