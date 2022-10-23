import { useContext, useEffect } from "react"

import { NavigationContext } from "components/Providers/NavigationContext"
import { RoutingContext } from "components/Providers/RoutingContext"
import { resultToSegments } from "components/Route"
import FindPath from "pathfinding/findPath"
import { session } from "utils/localUtils"

import { stopToNumber } from "./getNavigationInstruction"
import useVoiceNavigation from "./useVoiceNavigation"

export default function useNavigation() {
  const { currentRoute, setCurrentRoute, spokenRoute, setSpokenRoute } =
    useContext(NavigationContext)
  const { allowedModes } = useContext(RoutingContext)

  useEffect(() => {
    const firstSpoken = spokenRoute[0]
    const firstCurrent = currentRoute[0]
    const spokenProvider = firstSpoken?.routes[0]?.provider
    const currentProvider = firstCurrent?.routes[0]?.provider
    const spokenNumber = stopToNumber(firstSpoken?.from.uniqueId)
    const currentNumber = stopToNumber(firstCurrent?.from.uniqueId)
    const toNumber = stopToNumber(firstSpoken?.to.uniqueId)

    if (firstSpoken && firstCurrent) {
      // we are still going to the same stop
      if (firstSpoken.to.uniqueId === firstCurrent.to.uniqueId) {
        // and are still on the same line
        if (spokenProvider === currentProvider) {
          // and we are in the middle of the route spoken
          if (
            (spokenNumber < currentNumber && currentNumber < toNumber) ||
            (spokenNumber > currentNumber && currentNumber > toNumber)
          ) {
            // the spoken route is still valid
            return undefined
          }
        }
      }
    }

    return setSpokenRoute(currentRoute)
  }, [currentRoute, setSpokenRoute, spokenRoute])

  const destinationId = currentRoute[currentRoute.length - 1]?.to.uniqueId || ""

  let pathfinder: FindPath | undefined

  const updateRoute = () => {
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
              setCurrentRoute(segments)

              // set point of interest
              const poi = segments[0]?.to.location
              session.pointOfInterest = poi
            })
            .catch(e => {
              console.error("error converting result to segments during nav", e)
              setCurrentRoute([])
            })
        })
        .catch(e => {
          console.error("Error while finding path during nav", e)
          setCurrentRoute([])
        })
    }
  }

  useVoiceNavigation(spokenRoute)

  useEffect(() => {
    const interval = setInterval(updateRoute, 10 * 1000)
    return () => {
      clearInterval(interval)
    }
  })
}
