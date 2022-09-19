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
  isOpen: boolean
  position: number
}

export default function Segment({ segment, isOpen, position }: SegmentProps) {
  const singleRoute = segment.routes.length === 1
  const walkingRoute = segment.routes.length === 0
  const variant = useMedia(`(min-width: ${media.small}px)`)
    ? "desktop"
    : "mobile"
  const wrapper = useRef<HTMLDivElement>(null)

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      if (isOpen)
        gsap.fromTo(wrapper.current, {
            y: 200,
            yPercent: 100,
            opacity: 0,
            height: 0,
          },
          {
            y: 0,
            yPercent: 0,
            opacity: 1,
            height: "auto",
            delay: 0.3 + 0.1 * position,
            ease: "power3.out",
          })
      else
        gsap.set(wrapper.current, {
          y: 200,
        })
      firstRender.current = false
    }
  }, [isOpen, position])

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
