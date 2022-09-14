import React from "react"

import { SegmentType } from "../createSegments"
import SingleRoute from "./SingleRoute"

interface SegmentProps {
  segment: SegmentType
}

export default function Segment({ segment }: SegmentProps) {
  const singleRoute = segment.routes.length === 1
  const walkingRoute = segment.routes.length === 0

  if (walkingRoute) return <div />

  return singleRoute ? <SingleRoute segment={segment} /> : <div />
}
