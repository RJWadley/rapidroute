import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { RouteMode, shortHandMap } from "@rapidroute/database-types"

import { getAll } from "data/getData"
import { search } from "data/search"

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

  /**
   * on load, read the state from the URL
   */
  useEffect(() => {
    const url = new URL(window.location.href)
    const initFrom = url.searchParams.get("from")
    const initTo = url.searchParams.get("to")
    getAll("searchIndex")
      .then(index => {
        if (initFrom)
          setFrom(
            index[initFrom]?.uniqueId ??
              search(initFrom).filter(x => x !== "Current Location")[0] ??
              initFrom
          )
        if (initTo)
          setTo(
            index[initTo]?.uniqueId ??
              search(initTo).filter(x => x !== "Current Location")[0] ??
              initTo
          )
      })
      .catch(console.error)
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
    const url = new URL(window.location.href)
    if (from) url.searchParams.set("from", from)
    else url.searchParams.delete("from")
    if (to) url.searchParams.set("to", to)
    else url.searchParams.delete("to")
    window.history.replaceState({}, "", url.toString())
  }, [from, to, allowedModes])

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  )
}
