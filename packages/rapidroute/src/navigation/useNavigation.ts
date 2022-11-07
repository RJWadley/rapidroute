/* eslint-disable no-console */
import { useContext, useEffect, useRef } from "react"

import { PlaceType } from "@rapidroute/database-types"

import { NavigationContext } from "components/Providers/NavigationContext"
import { RoutingContext } from "components/Providers/RoutingContext"
import { resultToSegments } from "components/Route"
import FindPath from "pathfinding/findPath"
import { getLocal, session } from "utils/localUtils"

import { stopToNumber } from "./getNavigationInstruction"
import useVoiceNavigation from "./useVoiceNavigation"

const CompletionThresholds: Record<PlaceType, number> = {
  "MRT Station": 100,
  Airport: 500,
  City: 500,
  Coordinate: 100,
  Other: 100,
}

/**
 * navigate to a destination, providing voice navigation and updating directions as needed
 */
export default function useNavigation() {
  const { currentRoute, setCurrentRoute, spokenRoute, setSpokenRoute } =
    useContext(NavigationContext)
  const { allowedModes } = useContext(RoutingContext)

  /**
   * start voice navigation
   */
  useVoiceNavigation(spokenRoute)

  /**
   * set player for map
   */
  session.following = getLocal("selectedPlayer")?.toString() ?? undefined

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
   * Update the spoken route when needed
   */
  useEffect(() => {
    const firstSpoken = spokenRoute[0]
    const spokenProvider = firstSpoken?.routes[0]?.provider
    const spokenNumber = stopToNumber(firstSpoken?.from.uniqueId)

    const firstCurrent = currentRoute[0]
    const currentProvider = firstCurrent?.routes[0]?.provider
    const currentNumber = stopToNumber(firstCurrent?.from.uniqueId)
    const destinationNumber = stopToNumber(firstSpoken?.to.uniqueId)

    // for MRT lines
    if (firstSpoken && firstCurrent) {
      // we are still going to the same stop
      if (firstSpoken.to.uniqueId === firstCurrent.to.uniqueId) {
        // and are still on the same line
        if (spokenProvider === currentProvider) {
          // and we are still within the bounds of the route we spoke
          if (
            (spokenNumber < currentNumber &&
              currentNumber < destinationNumber) ||
            (spokenNumber > currentNumber && currentNumber > destinationNumber)
          ) {
            // the spoken route is still valid
            return undefined
          }
        }
      }
    }

    const distanceBetweenLocs = Math.sqrt(
      ((firstSpoken?.to?.location?.x ?? Infinity) -
        (firstCurrent?.from?.location?.x ?? Infinity)) **
        2 +
        ((firstSpoken?.to?.location?.z ?? Infinity) -
          (firstCurrent?.from?.location?.z ?? Infinity)) **
          2
    )

    // check if the system has rerouted us before we get to the destination
    // if the new from location is the same as the old to location
    if (
      firstSpoken &&
      firstCurrent &&
      // either the id's match
      (firstSpoken.to.uniqueId === firstCurrent.from.uniqueId ||
        // or they are within a reasonable distance of each other
        distanceBetweenLocs <
          Math.max(
            CompletionThresholds[firstSpoken.to.type],
            CompletionThresholds[firstCurrent.from.type]
          ))
    ) {
      console.log("locations match")
      // and we are too far away from that location
      const { x: fromX, z: fromZ } = session.lastKnownLocation || {}
      const { x: toX, z: toZ } = firstSpoken.to.location || {}
      const distance = Math.sqrt(
        ((fromX ?? Infinity) - (toX ?? Infinity)) ** 2 +
          ((fromZ ?? Infinity) - (toZ ?? Infinity)) ** 2
      )

      if (distance > CompletionThresholds[firstSpoken.to.type]) {
        console.log("distance too far")
        // we are not close enough to the destination to be considered there
        // so leave the spoken route as is
        return undefined
      }
      console.log("we are close enough to the destination")
    } else {
      console.log("locations do not match")
      console.log("firstSpoken", firstSpoken)
      console.log("firstCurrent", firstCurrent)
      console.log("distanceBetweenLocs", distanceBetweenLocs)
    }

    // if we reach this point, the spoken route is no longer valid and we need to update it
    return setSpokenRoute(currentRoute)
  }, [currentRoute, setSpokenRoute, spokenRoute])

  /**
   * Keep the current route up to date
   */
  const destinationId = currentRoute[currentRoute.length - 1]?.to.uniqueId || ""
  useEffect(() => {
    /**
     * Calculate and save a new route
     */
    const updateRoute = () => {
      let pathfinder: FindPath | undefined

      const playersLocation = session.lastKnownLocation
      if (playersLocation) {
        const { x, z } = playersLocation
        const coordId = `Coordinate: ${x}, ${z}`

        pathfinder?.cancel()
        pathfinder = new FindPath(coordId, destinationId, allowedModes)

        pathfinder
          .start()
          .then(results => {
            const result = results[0]
            resultToSegments(result)
              .then(segments => {
                /**
                 * if we've reached the destination, but the player is not there,
                 * don't update the route
                 */
                if (segments.length === 1) {
                  return
                }

                /**
                 * Update the current route
                 */
                if (!segments[0].routes.length) {
                  // if the first segment is a walk, remove it
                  segments.shift()
                }
                setCurrentRoute(segments)
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
    const interval = setInterval(updateRoute, 10 * 1000)
    return () => {
      clearInterval(interval)
    }
  }, [allowedModes, destinationId, setCurrentRoute])
}
