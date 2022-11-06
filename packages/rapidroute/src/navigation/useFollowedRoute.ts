import { useState } from "react"

import { useDeepCompareEffect } from "use-deep-compare"

import { SegmentType } from "components/createSegments"

/**
 * given the most up-to-date route from the player to the destination,
 * track and return the player's path from the initial navigation start to the player
 * @param route the current route the player is following
 * @returns the path from navigation start to the player now
 */
export default function useFollowedRoute(route: SegmentType[]) {
  const [previousRoute, setPreviousRoute] = useState<SegmentType[] | null>(null)
  const [followedRoute, setFollowedRoute] = useState<SegmentType[]>([])

  useDeepCompareEffect(() => {
    // skip if we have no route or if first run
    if (!route.length) return
    if (previousRoute === null) {
      setPreviousRoute(route)
      return
    }

    const firstSegment = route[0]

    const firstTo = previousRoute[0]?.to
    const secondTo = previousRoute[1]?.to
    const { from } = firstSegment

    if (firstTo?.uniqueId === from.uniqueId)
      setFollowedRoute([...followedRoute, previousRoute[0]])
    else if (secondTo?.uniqueId === from.uniqueId)
      setFollowedRoute([...followedRoute, previousRoute[0], previousRoute[1]])

    setPreviousRoute(route)
  }, [followedRoute, previousRoute, route])

  return followedRoute
}
