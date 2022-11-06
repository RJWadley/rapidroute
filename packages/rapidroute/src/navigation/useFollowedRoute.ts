import { useEffect, useState } from "react"

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

  useEffect(() => {
    // skip if we have no route or if first run
    if (!route.length) return
    if (previousRoute === null) {
      setPreviousRoute(route)
      return
    }

    // TODO this seems broken

    const firstSegment = route[0]

    const firstTo = previousRoute[0]?.to
    const secondTo = previousRoute[1]?.to
    const { from } = firstSegment

    if (
      firstTo.uniqueId === from.uniqueId ||
      secondTo?.uniqueId === from.uniqueId
    ) {
      setFollowedRoute([...followedRoute, previousRoute[0]])
    }

    setPreviousRoute(route)
  }, [followedRoute, previousRoute, route])

  return followedRoute
}
