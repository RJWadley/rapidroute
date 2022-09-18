import React, { useEffect, useRef } from "react"
import useMedia from "utils/useMedia"

import gsap from "gsap"
import media from "utils/media"
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
  const variant = useMedia(`(min-width: ${media.small}px)`)
    ? "desktop"
    : "mobile"
  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.set(wrapper.current, {
      y: 200,
    })
  }, [])

  if (walkingRoute)
    return (
      <div ref={wrapper}>
        <WalkingRoute segment={segment} variant={variant} />
      </div>
    )

  return (
    <div ref={wrapper}>
      {singleRoute ? (
        <SingleRoute segment={segment} variant={variant} />
      ) : (
        <MultiRoute segment={segment} variant={variant} />
      )}
    </div>
  )
}
