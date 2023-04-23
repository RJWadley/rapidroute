import { SegmentType } from "components/Segment/createSegments"
import { useEffect } from "react"
import { getLocal, setLocal } from "utils/localUtils"

import { CompletionThresholds } from "./useVoiceNavigation"

/**
 * given a route, set the point of interest for the map and keep it updated
 */
export default function usePointOfInterest(route: SegmentType[]) {
  useEffect(() => {
    const updatePointOfInterest = () => {
      // point of interest is the from location if we're there, otherwise the to location
      const firstSpoken = route[0]
      if (!firstSpoken) return

      // if this is a walk, we want to use the to location always
      if (firstSpoken.routes.length === 0) {
        setLocal("pointOfInterest", firstSpoken.to.location)

        return
      }

      const { x: playerX, z: playerZ } = getLocal("lastKnownLocation") ?? {}
      const { x: locationX, z: locationZ } = firstSpoken.from.location ?? {}
      const distance = Math.sqrt(
        ((playerX ?? Infinity) - (locationX ?? Infinity)) ** 2 +
          ((playerZ ?? Infinity) - (locationZ ?? Infinity)) ** 2
      )
      if (distance < CompletionThresholds[firstSpoken.from.type]) {
        setLocal("pointOfInterest", firstSpoken.from.location)
      } else {
        setLocal("pointOfInterest", firstSpoken.to.location)
      }
    }

    const interval = setInterval(updatePointOfInterest, 1000)
    updatePointOfInterest()
    return () => {
      clearInterval(interval)
    }
  }, [route])
}
