import { useEffect, useState } from "react"

import { SegmentType } from "components/createSegments"

export default function useFollowedRoute(route: SegmentType[]) {
  const [previousSegment, setPreviousSegment] = useState<SegmentType | null>(
    null
  )
  const [followedRoute, setFollowedRoute] = useState<SegmentType[]>([])

  useEffect(() => {
    if (!route.length) return
    if (previousSegment === null) {
      setPreviousSegment(route[0])
    }

    const firstSegment = route[0]

    if (previousSegment?.from) {
      if (firstSegment.from.uniqueId === previousSegment.to.uniqueId) {
        setFollowedRoute([...followedRoute, firstSegment])
      }
    }

    setPreviousSegment(firstSegment)
  }, [followedRoute, previousSegment, route])

  return followedRoute
}
