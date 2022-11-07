import React, { createContext, ReactNode, useMemo, useState } from "react"

import { SegmentType } from "components/createSegments"

export const NavigationContext = createContext<{
  /**
   * The route the user would prefer to take, if possible
   */
  preferredRoute: string[]
  /**
   * Update the route the user would prefer to take, if possible
   */
  setPreferredRoute: React.Dispatch<React.SetStateAction<string[]>>
  /**
   * The route the navigation system is currently trying to take
   */
  currentRoute: SegmentType[]
  /**
   * Update the route the navigation system is currently trying to take
   */
  setCurrentRoute: React.Dispatch<React.SetStateAction<SegmentType[]>>
  /**
   * The route the navigation system is using to give directions.
   * This often differs from the current route, since it won't update until
   * the user has reached a point of interest
   *
   * (for example, while moving from stop to stop on an MRT line, updates are suppressed)
   */
  spokenRoute: SegmentType[]
  /**
   * Update the route the navigation system is using to give directions
   */
  setSpokenRoute: React.Dispatch<React.SetStateAction<SegmentType[]>>
  /**
   * navigationComplete is true when the user has reached their destination
   */
  navigationComplete: boolean
  /**
   * Update navigationComplete
   */
  setNavigationComplete: React.Dispatch<React.SetStateAction<boolean>>
}>({
  preferredRoute: [],
  setPreferredRoute: () => {},
  currentRoute: [],
  setCurrentRoute: () => {},
  spokenRoute: [],
  setSpokenRoute: () => {},
  navigationComplete: false,
  setNavigationComplete: () => {},
})

export function NavigationProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [preferredRoute, setPreferredRoute] = useState<string[]>([])
  const [currentRoute, setCurrentRoute] = useState<SegmentType[]>([])
  const [spokenRoute, setSpokenRoute] = useState<SegmentType[]>([])
  const [navigationComplete, setNavigationComplete] = useState(false)

  const value = useMemo(() => {
    return {
      preferredRoute,
      setPreferredRoute,
      currentRoute,
      setCurrentRoute,
      spokenRoute,
      setSpokenRoute,
      navigationComplete,
      setNavigationComplete,
    }
  }, [currentRoute, navigationComplete, preferredRoute, spokenRoute])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}
