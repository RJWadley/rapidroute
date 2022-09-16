import React, { useMemo, useState } from "react"

type LocationId = string

// create a provider
export const RoutingContext = React.createContext<{
  from: LocationId | null
  to: LocationId | null
  setFrom: (from: LocationId | null) => void
  setTo: (to: LocationId | null) => void
}>({
  from: null,
  to: null,
  setFrom: () => {},
  setTo: () => {},
})

export function RoutingProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [from, setFrom] = useState<LocationId | null>(null)
  const [to, setTo] = useState<LocationId | null>(null)

  const value = useMemo(() => {
    return {
      from,
      to,
      setFrom,
      setTo,
    }
  }, [from, to, setFrom, setTo])

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  )
}
