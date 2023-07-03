import { useQuery } from "@tanstack/react-query"
import { wrap } from "comlink"
import { NavigationContext } from "components/Providers/NavigationContext"
import { RoutingContext } from "components/Providers/RoutingContext"
import { resultToSegments } from "components/Route"
import { SegmentType } from "components/Segment/createSegments"
import { getAll } from "data/getData"
import { ResultType } from "pathfinding/findPath"
import { FindPathWorkerType } from "pathfinding/findPath/findPathWorker"
import { useContext, useEffect, useRef } from "react"
import { isBrowser } from "utils/functions"
import { getLocal, setLocal } from "utils/localUtils"

import usePointOfInterest from "./usePointOfInterest"
import useVoiceNavigation, { CompletionThresholds } from "./useVoiceNavigation"

const { findPath, initPathfinder } =
  (() => {
    if (!isBrowser()) return
    const worker = new Worker(
      new URL("pathfinding/findPath/findPathWorker", import.meta.url)
    )
    return wrap<FindPathWorkerType>(worker)
  })() ?? {}

getAll("pathfinding")
  .then(data => {
    return initPathfinder?.(data)
  })
  .catch(console.error)

/**
 * navigate to a destination, providing voice navigation and updating directions as needed
 */
export default function useNavigation() {
  const {
    currentRoute,
    setCurrentRoute,
    spokenRoute,
    setSpokenRoute,
    setNavigationComplete,
    preferredRoute,
  } = useContext(NavigationContext)
  const { allowedModes } = useContext(RoutingContext)
  const destinationId = currentRoute[currentRoute.length - 1]?.to.uniqueId

  // start voice navigation
  useVoiceNavigation(spokenRoute)
  // keep the map updated
  usePointOfInterest(spokenRoute)
  // make sure we're following the player
  setLocal("following", getLocal("selectedPlayer")?.toString())

  /**
   * set initial spoken route to match current route
   */
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current && currentRoute.length > 0) {
      firstRender.current = false
      setSpokenRoute(currentRoute)
    }
  }, [currentRoute, setSpokenRoute])

  /**
   * determine how well a route matches the preferred route
   * routes gain points for each stop that occurs in the preferred route
   */
  const calculateRouteMatch = (result: ResultType) => {
    let score = 0
    result.path.forEach(leg => {
      if (preferredRoute.includes(leg)) {
        score += 1
      }
    })
    return score
  }

  /**
   * apply the new route
   */
  const updateRoute = (segments: SegmentType[]) => {
    /**
     * if we've reached the destination, but the player is not there,
     * don't update the route, since we need to wait for the player to get there first
     */
    if (segments.length === 1) {
      // check if we've reached the destination
      const { x: fromX, z: fromZ } = getLocal("lastKnownLocation") ?? {}
      const { x: toX, z: toZ } = segments[0]?.to.coords ?? {}
      const distance = Math.sqrt(
        ((fromX ?? Infinity) - (toX ?? Infinity)) ** 2 +
          ((fromZ ?? Infinity) - (toZ ?? Infinity)) ** 2
      )

      if (distance < CompletionThresholds[segments[0]?.to.type ?? "Other"])
        setNavigationComplete(true)
      else setNavigationComplete(false)

      // if the segment is a walk, use the last segment from the previous route
      if (segments[0]?.routes.length === 0) {
        setCurrentRoute(previous => previous.slice(-1))
        return
      }
    }

    /**
     * now update the route
     * if it's not a walk, update the route as normal
     * if it is a walk, we need to do a few extra things
     */
    if (segments[0]?.routes.length) {
      // if the first segment is not a walk, update the route as normal
      setCurrentRoute(segments)
    } else {
      // if the length of the walk is more than 500 blocks, leave the walk in
      const { x: fromX, z: fromZ } = segments[0]?.from.coords ?? {}
      const { x: toX, z: toZ } = segments[0]?.to.coords ?? {}
      const distance = Math.sqrt(
        ((fromX ?? Infinity) - (toX ?? Infinity)) ** 2 +
          ((fromZ ?? Infinity) - (toZ ?? Infinity)) ** 2
      )

      if (distance > 500) setCurrentRoute(segments)
      else {
        // otherwise
        // if the first segment is a walk, remove it
        // UNLESS the walk's destination is the previous third segment's origin
        // because that means the walk is part of the original route
        // if this is the case, we want to use the walk from the original route
        // (so it doesn't get spoken over and over)
        setCurrentRoute(previousRoute => {
          const thirdSegment = previousRoute[2]
          const previousWalk = previousRoute[1]
          const newWalk = segments.shift()
          if (
            thirdSegment &&
            previousWalk &&
            newWalk &&
            thirdSegment.from.uniqueId === newWalk.to.uniqueId
          ) {
            return [previousWalk, ...segments]
          }
          return segments
        })
      }
    }
  }

  /**
   * Calculate and save a new route
   */
  const recalculateRoute = async () => {
    const playersLocation = getLocal("lastKnownLocation")
    if (!playersLocation || !destinationId) return
    const { x, z } = playersLocation
    const coordId = `Coordinate: ${x}, ${z}`
    const results =
      (await findPath?.(coordId, destinationId, allowedModes)) ?? []

    // sort the results by distance and by route match
    const sortedResults = results.sort((a, b) => a.totalCost - b.totalCost)
    const preferredSegment = sortedResults.sort(
      (a, b) => calculateRouteMatch(b) - calculateRouteMatch(a)
    )[0]
    if (!preferredSegment) return

    const segments = await resultToSegments(preferredSegment)
    updateRoute(segments)
  }

  /**
   * update the route every 10 seconds
   */
  useQuery({
    queryKey: ["recalculateRoute", destinationId],
    refetchInterval: 10_000,
    queryFn: recalculateRoute,
  })
}
