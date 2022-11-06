import React, { createContext, ReactNode, useMemo, useState } from "react"

import { SegmentType } from "components/createSegments"

export const NavigationContext = createContext<{
  preferredRoute: string[]
  setPreferredRoute: (preferredRoute: string[]) => void
  currentRoute: SegmentType[]
  setCurrentRoute: (currentRoute: SegmentType[]) => void
  spokenRoute: SegmentType[]
  setSpokenRoute: (spokenRoute: SegmentType[]) => void
}>({
  preferredRoute: [],
  setPreferredRoute: () => {},
  currentRoute: [],
  setCurrentRoute: () => {},
  spokenRoute: [],
  setSpokenRoute: () => {},
})

export function NavigationProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [preferredRoute, setPreferredRoute] = useState<string[]>([])
  const [currentRoute, setCurrentRoute] = useState<SegmentType[]>([])
  const [spokenRoute, setSpokenRoute] = useState<SegmentType[]>([])

  const value = useMemo(() => {
    return {
      preferredRoute,
      setPreferredRoute,
      currentRoute,
      setCurrentRoute,
      spokenRoute,
      setSpokenRoute,
    }
  }, [currentRoute, preferredRoute, spokenRoute])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}
