"use client"

import type { RouteType } from "@prisma/client"
import { allRouteTypes } from "database/helpers"
import { useSearchResults } from "database/search"
import type { PlaceSearchItem } from "database/usePlaceSearch"
import type { ReactNode } from "react"
import { createContext, useMemo, useState } from "react"
import { useParamState } from "utils/localUtils/useParamState"

interface Place {
  id: string
}

const throwError = () => {
  throw new Error("no provider")
}

export const RoutingContext = createContext<{
  /**
   * unique id of the origin location
   */
  from: Place | null
  /**
   * unique id of the destination location
   */
  to: Place | null
  /**
   * update the origin location
   */
  setFrom: (from: Place | null) => void
  /**
   * update the destination location
   */
  setTo: (to: Place | null) => void
  /**
   * list of modes to use for routing
   */
  allowedModes: readonly RouteType[]
  /**
   * update the list of modes to use for routing
   */
  setAllowedModes: (modes: RouteType[]) => void
}>({
  from: null,
  to: null,
  setFrom: throwError,
  setTo: throwError,
  allowedModes: allRouteTypes,
  setAllowedModes: throwError,
})

export function RoutingProvider({
  children,
  places,
}: {
  children: ReactNode
  places: PlaceSearchItem[]
}): JSX.Element {
  const [from, setFrom] = useParamState("from")
  const [to, setTo] = useParamState("to")
  const [allowedModes, setAllowedModes] = useState<readonly RouteType[]>(
    // TODO fix this
    // allRouteTypes.filter((m) => m !== "spawnWarp"),
    allRouteTypes,
  )

  const fromResult = useSearchResults(from, places, (p) => JSON.stringify(p))[0]
  const toResult = useSearchResults(to, places, (p) => JSON.stringify(p))[0]

  const value = useMemo(() => {
    const exactFrom = places.find((p) => p.id === from)
    const exactTo = places.find((p) => p.id === to)

    const externalSetFrom = (newFrom: Place | null) => {
      setFrom(newFrom?.id ?? null)
    }

    const externalSetTo = (newTo: Place | null) => {
      setTo(newTo?.id ?? null)
    }

    return {
      from: exactFrom ?? (from ? fromResult : null) ?? null,
      to: exactTo ?? (to ? toResult : null) ?? null,
      setFrom: externalSetFrom,
      setTo: externalSetTo,
      allowedModes,
      setAllowedModes,
    }
  }, [allowedModes, from, fromResult, places, setFrom, setTo, to, toResult])

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  )
}
