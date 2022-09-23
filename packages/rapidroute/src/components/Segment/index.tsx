import React, { useContext, useLayoutEffect, useRef } from "react"
import useMedia from "utils/useMedia"

import gsap from "gsap"
import media from "utils/media"
import { RoutingContext } from "components/Providers/RoutingContext"
import { SegmentType } from "../createSegments"
import MultiRoute from "./MultiRoute"
import SingleRoute from "./SingleRoute"
import WalkingRoute from "./WalkingRoute"
import WarpRoute from "./WarpRoute"

interface SegmentProps {
  segment: SegmentType
  isOpen: boolean
  position: number
}

export default function Segment({ segment, isOpen, position }: SegmentProps) {
  const variant = useMedia(media.mobile) ? "mobile" : "desktop"
  const wrapper = useRef<HTMLDivElement>(null)
  const singleRoute = segment.routes.length === 1
  const walkingRoute = segment.routes.length === 0
  const { allowedModes } = useContext(RoutingContext)
  const initialAllowedModes = useRef(allowedModes)

  const isWarp =
    initialAllowedModes.current.includes("spawnWarp") &&
    walkingRoute &&
    (segment.from.uniqueId === "A0" || segment.to.uniqueId === "A0")

  const firstRender = useRef(true)
  useLayoutEffect(() => {
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

  if (isWarp)
    return (
      <div ref={wrapper}>
        <WarpRoute segment={segment} variant={variant} />
      </div>
    )

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
