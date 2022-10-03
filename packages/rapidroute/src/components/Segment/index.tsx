import React, { useContext, useRef } from "react"

import styled from "styled-components"

import { RoutingContext } from "components/Providers/RoutingContext"
import media from "utils/media"
import useMedia from "utils/useMedia"

import { SegmentType } from "../createSegments"
import MultiRoute from "./MultiRoute"
import SingleRoute from "./SingleRoute"
import WalkingRoute from "./WalkingRoute"
import WarpRoute from "./WarpRoute"

interface SegmentProps {
  segment: SegmentType
  forceMobile?: boolean
}

export default function Segment({
  segment,
  forceMobile = false,
}: SegmentProps) {
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

  if (isWarp)
    return (
      <Wrapper ref={wrapper}>
        <WarpRoute
          forceMobile={forceMobile}
          segment={segment}
          variant={variant}
        />
      </Wrapper>
    )

  if (walkingRoute)
    return (
      <Wrapper ref={wrapper}>
        <WalkingRoute
          forceMobile={forceMobile}
          segment={segment}
          variant={variant}
        />
      </Wrapper>
    )

  return (
    <Wrapper ref={wrapper}>
      {singleRoute ? (
        <SingleRoute
          forceMobile={forceMobile}
          segment={segment}
          variant={variant}
        />
      ) : (
        <MultiRoute
          forceMobile={forceMobile}
          segment={segment}
          variant={variant}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transform: translate(0, 200px);
  opacity: 0;
`
