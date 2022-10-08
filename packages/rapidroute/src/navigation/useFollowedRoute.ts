import { useEffect, useState } from "react"

import { SegmentType } from "components/createSegments"

export default function useFollowedRoute(route: SegmentType[]) {
  const [previousRoute, setPreviousRoute] = useState<SegmentType[] | null>(null)
  const [followedRoute, setFollowedRoute] = useState<SegmentType[]>([])

  useEffect(() => {
    if (!route.length) return
    if (previousRoute === null) {
      setPreviousRoute(route)
      return
    }

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
