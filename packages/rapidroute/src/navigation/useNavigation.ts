import { useContext, useEffect } from "react"

import { NavigationContext } from "components/Providers/NavigationContext"
import { RoutingContext } from "components/Providers/RoutingContext"
import { resultToSegments } from "components/Route"
import FindPath from "pathfinding/findPath"
import { getLocal, session } from "utils/localUtils"

import { stopToNumber } from "./getNavigationInstruction"
import useVoiceNavigation from "./useVoiceNavigation"

/**
 * navigate to a destination, providing voice navigation and updating directions as needed
 */
export default function useNavigation() {
  const {
    currentRoute,
    setCurrentRoute,
    spokenRoute,
    setSpokenRoute,
    setIsRouteComplete,
  } = useContext(NavigationContext)
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
                 * Check if the player has reached the destination (within 200m)
                 */
                const lastSegment = segments[segments.length - 1]
                const playerLocation = session.lastKnownLocation
                if (playerLocation) {
                  const { x: fromX, z: fromZ } = playerLocation
                  const { x: toX, z: toZ } = lastSegment?.to.location || {}
                  const distance = Math.sqrt(
                    (fromX - (toX ?? Infinity)) ** 2 +
                      (fromZ - (toZ ?? Infinity)) ** 2
                  )

                  if (distance < 200) {
                    // player has reached the destination
                    setCurrentRoute(segments)
                    setIsRouteComplete(true)
                    session.pointOfInterest = undefined
                    return
                  }
                }

                /**
                 * Update the current route
                 */
                // first, if the first segment is a walk, remove it
                if (segments[0].routes.length === 0 && segments.length > 1) {
                  segments.shift()
                }
                setCurrentRoute(segments)

                /**
                 * set the point of interest
                 */
                const poi = segments[0]?.to.location
                session.pointOfInterest = poi
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
  }, [allowedModes, destinationId, setCurrentRoute, setIsRouteComplete])
}
