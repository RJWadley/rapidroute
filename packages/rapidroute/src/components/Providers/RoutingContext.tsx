import React, { createContext, ReactNode, useMemo, useState } from "react"

import { RouteMode, shortHandMap } from "@rapidroute/database-types"

type LocationId = string

export const RoutingContext = createContext<{
  /**
   * unique id of the origin location
   */
  from: LocationId | null
  /**
   * unique id of the destination location
   */
  to: LocationId | null
  /**
   * update the origin location
   */
  setFrom: (from: LocationId | null) => void
  /**
   * update the destination location
   */
  setTo: (to: LocationId | null) => void
  /**
   * list of modes to use for routing
   */
  allowedModes: RouteMode[]
  /**
   * update the list of modes to use for routing
   */
  setAllowedModes: (modes: RouteMode[]) => void
}>({
  from: null,
  to: null,
  setFrom: () => {},
  setTo: () => {},
  allowedModes: Object.values(shortHandMap),
  setAllowedModes: () => {},
})

export function RoutingProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [from, setFrom] = useState<LocationId | null>(null)
  const [to, setTo] = useState<LocationId | null>(null)
  const [allowedModes, setAllowedModes] = useState<RouteMode[]>([
    ...Object.values(shortHandMap).filter(m => m !== "spawnWarp"),
  ])

  const value = useMemo(() => {
    return {
      from,
      to,
      setFrom,
      setTo,
      allowedModes,
      setAllowedModes,
    }
  }, [from, to, allowedModes])

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  )
}
