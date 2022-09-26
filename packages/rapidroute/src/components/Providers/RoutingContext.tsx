import React, { createContext, ReactNode, useMemo, useState } from "react"

import { RouteMode, shortHandMap } from "@rapidroute/database-types"

type LocationId = string

// create a provider
export const RoutingContext = createContext<{
  from: LocationId | null
  to: LocationId | null
  setFrom: (from: LocationId | null) => void
  setTo: (to: LocationId | null) => void
  allowedModes: RouteMode[]
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
