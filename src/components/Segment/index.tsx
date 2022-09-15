import React from "react"

import { SegmentType } from "../createSegments"
import MultiRoute from "./MultiRoute"
import SingleRoute from "./SingleRoute"
import WalkingRoute from "./WalkingRoute"

interface SegmentProps {
  segment: SegmentType
}

export default function Segment({ segment }: SegmentProps) {
  const singleRoute = segment.routes.length === 1
  const walkingRoute = segment.routes.length === 0

  if (walkingRoute) return <WalkingRoute segment={segment} />

  return singleRoute ? (
    <SingleRoute segment={segment} />
  ) : (
    <MultiRoute segment={segment} />
  )
}
