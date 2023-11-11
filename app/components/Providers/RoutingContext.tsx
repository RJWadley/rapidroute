import type { RouteType } from "@prisma/client"
import { allRouteTypes } from "database/helpers"
import type { ReactNode } from "react"
import { createContext, useEffect, useMemo, useRef, useState } from "react"
import { clearLocal, getLocal, setLocal } from "utils/localUtils"

type LocationId = string

const throwError = () => {
  throw new Error("no provider")
}

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
}: {
  children: ReactNode
}): JSX.Element {
  const [from, setFrom] = useState<LocationId | null>(null)
  const [to, setTo] = useState<LocationId | null>(null)
  const [allowedModes, setAllowedModes] = useState<readonly RouteType[]>(
    // TODO fix this
    // allRouteTypes.filter((m) => m !== "spawnWarp"),
    allRouteTypes,
  )

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

  /**
   * on load, read the state from the URL
   */
  useEffect(() => {
    // todo fix
    // const initFrom = getLocal("from")
    // const initTo = getLocal("to")
    // if (initFrom || initTo) {
    //   getAll("searchIndex")
    //     .then((index) => {
    //       if (initFrom)
    //         setFrom(
    //           index[initFrom]?.uniqueId ??
    //             search(initFrom).find((x) => x !== "Current Location") ??
    //             initFrom,
    //         )
    //       if (initTo)
    //         setTo(
    //           index[initTo]?.uniqueId ??
    //             search(initTo).find((x) => x !== "Current Location") ??
    //             initTo,
    //         )
    //       return null
    //     })
    //     .catch(console.error)
    // }
  }, [])

  /**
   * store the current state in the URL
   */
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      // skip the first render to avoid clearing params from before
      firstRender.current = false
      return
    }
    if (from) setLocal("from", from)
    else clearLocal("from")
    if (to) setLocal("to", to)
    else clearLocal("to")
  }, [from, to, allowedModes])

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  )
}
