/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useRef } from "react"

import { NavigationContext } from "components/Providers/NavigationContext"
import { RoutingContext } from "components/Providers/RoutingContext"
import { resultToSegments } from "components/Route"
import { getAll } from "data/getData"
import { ResultType } from "pathfinding/findPath"
import { WorkerFunctions } from "pathfinding/findPath/findPathWorker"
import { isBrowser } from "utils/functions"
import { getLocal, setLocal } from "utils/localUtils"
import { wrap } from "utils/promise-worker"

import useVoiceNavigation, { CompletionThresholds } from "./useVoiceNavigation"

const rawWrapper = (async () => {
  const worker =
    isBrowser() &&
    new Worker(new URL("pathfinding/findPath/findPathWorker", import.meta.url))
  return worker && wrap<WorkerFunctions>(worker)
})()
getAll("pathfinding")
  .then(async data => {
    const wrapper = await rawWrapper
    if (wrapper) wrapper.initPathfinder(data).catch(console.error)
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

  /**
   * start voice navigation
   */
  useVoiceNavigation(spokenRoute)

  /**
   * set player for map
   */
  setLocal("following", getLocal("selectedPlayer")?.toString())

  /**
   * set initial spoken route to match current route
   */
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current && currentRoute.length) {
      firstRender.current = false
      setSpokenRoute(currentRoute)
    }
  }, [currentRoute, setSpokenRoute])

  /**
   * Keep the current route up to date
   */
  const destinationId = currentRoute[currentRoute.length - 1]?.to.uniqueId || ""
  useEffect(() => {
    /**
     * Calculate and save a new route
     */
    const updateRoute = async () => {
      const wrapper = await rawWrapper
      if (!wrapper) return

      const playersLocation = getLocal("lastKnownLocation")
      if (playersLocation) {
        const { x, z } = playersLocation
        const coordId = `Coordinate: ${x}, ${z}`

        wrapper
          .findPath(coordId, destinationId, allowedModes)
          .then(results => {
            // sort the results by distance
            const sortedResults = results.sort(
              (a, b) => a.totalCost - b.totalCost
            )

            // sort the results by how well they match the preferred route
            // routes gain points for each stop that occurs in the preferred route
            const calculateScore = (result: ResultType) => {
              let score = 0
              result.path.forEach(leg => {
                if (preferredRoute.includes(leg)) {
                  score += 1
                }
              })
              return score
            }
            const sortedByPreferred = sortedResults.sort(
              (a, b) => calculateScore(b) - calculateScore(a)
            )

            resultToSegments(sortedByPreferred[0])
              .then(segments => {
                /**
                 * if we've reached the destination, but the player is not there,
                 * don't update the route
                 */
                if (segments.length === 1) {
                  // check if we've reached the destination
                  const { x: fromX, z: fromZ } =
                    getLocal("lastKnownLocation") ?? {}
                  const { x: toX, z: toZ } = segments[0].to.location || {}
                  const distance = Math.sqrt(
                    ((fromX ?? Infinity) - (toX ?? Infinity)) ** 2 +
                      ((fromZ ?? Infinity) - (toZ ?? Infinity)) ** 2
                  )

                  if (distance < CompletionThresholds[segments[0].to.type])
                    setNavigationComplete(true)
                  else setNavigationComplete(false)

                  // if the segment is a walk, use the last segment from the previous route
                  if (segments[0].routes.length === 0) {
                    setCurrentRoute(previous => previous.slice(-1))
                    return
                  }
                }

                /**
                 * Update the current route
                 */
                if (!segments[0].routes.length) {
                  // if the length of the walk is more than 500 blocks, leave the walk in
                  const { x: fromX, z: fromZ } = segments[0].from.location || {}
                  const { x: toX, z: toZ } = segments[0].to.location || {}
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
                } else {
                  // if the first segment is not a walk, update the route as normal
                  setCurrentRoute(segments)
                }
              })

              /**
               * If there's an issue, clear the route
               */
              .catch(e => {
                console.error(
                  "error converting result to segments during nav",
                  e
                )
                setCurrentRoute([])
              })
          })
          .catch(e => {
            console.error("Error while finding path during nav", e)
            setCurrentRoute([])
          })
      }
    }

    // update every 10 seconds
    const interval = setInterval(() => {
      updateRoute().catch(console.error)
    }, 10 * 1000)
    return () => {
      clearInterval(interval)
    }
  }, [
    allowedModes,
    destinationId,
    preferredRoute,
    setCurrentRoute,
    setNavigationComplete,
  ])

  /**
   * update point of interest on the map
   */
  const updatePointOfInterest = useCallback(() => {
    // point of interest is the from location if we're there, otherwise the to location
    const firstSpoken = spokenRoute[0]
    if (!firstSpoken) return

    // if this is a walk, we want to use the to location always
    if (firstSpoken.routes.length === 0) {
      setLocal("pointOfInterest", firstSpoken.to.location)

      return
    }

    const { x: playerX, z: playerZ } = getLocal("lastKnownLocation") || {}
    const { x: locationX, z: locationZ } = firstSpoken?.from.location || {}
    const distance = Math.sqrt(
      ((playerX ?? Infinity) - (locationX ?? Infinity)) ** 2 +
        ((playerZ ?? Infinity) - (locationZ ?? Infinity)) ** 2
    )
    if (distance < CompletionThresholds[firstSpoken?.from.type]) {
      setLocal("pointOfInterest", firstSpoken?.from.location)
    } else {
      setLocal("pointOfInterest", firstSpoken?.to.location)
    }
  }, [spokenRoute])

  // check every 1 seconds
  useEffect(() => {
    const interval = setInterval(updatePointOfInterest, 1 * 1000)
    updatePointOfInterest()
    return () => {
      clearInterval(interval)
    }
  }, [updatePointOfInterest])
}
