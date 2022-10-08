import { useContext, useEffect } from "react"

import { NavigationContext } from "components/Providers/NavigationContext"
import { RoutingContext } from "components/Providers/RoutingContext"
import { resultToSegments } from "components/Route"
import FindPath from "pathfinding/findPath"

import useVoiceNavigation from "./useVoiceNavigation"

export default function useNavigation() {
  const { currentRoute, setCurrentRoute } = useContext(NavigationContext)
  const { allowedModes } = useContext(RoutingContext)

  const destinationId = currentRoute[currentRoute.length - 1]?.to.uniqueId || ""

  let pathfinder: FindPath | undefined

  const updateRoute = () => {
    const playersLocation = window.lastKnownLocation

    if (playersLocation) {
      const { x, z } = playersLocation
      const coordId = `coordinate:${x}, ${z}`

      pathfinder?.cancel()
      pathfinder = new FindPath(coordId, destinationId, allowedModes)

      pathfinder.start().then(results => {
        const result = results[0]
        resultToSegments(result).then(segments => {
          setCurrentRoute(segments)

          // set point of interest
          const poi = segments[0].to.location
          window.pointOfInterest = poi
        })
      })
    }
  }

  useVoiceNavigation(currentRoute)

  useEffect(() => {
    const interval = setInterval(updateRoute, 10 * 1000)
    return () => {
      clearInterval(interval)
    }
  })
}
