import React, { useContext, useEffect, useState } from "react"

import gsap from "gsap"
import styled from "styled-components"

import { SegmentType } from "components/createSegments"
import { darkModeContext } from "components/Providers/DarkMode"
import { NavigationContext } from "components/Providers/NavigationContext"
import Segment from "components/Segment"
import media from "utils/media"
import useAnimation from "utils/useAnimation"
import useMedia from "utils/useMedia"

interface NavigationSegmentProps {
  segment: SegmentType
  segmentPosition: "previous" | "current" | "removed" | "previousFollowed"
  index: number
}

export default function NavigationSegment({
  segment,
  segmentPosition,
  index,
}: NavigationSegmentProps) {
  const { spokenRoute } = useContext(NavigationContext)
  const isDark = useContext(darkModeContext) ?? false
  const mobile = useMedia(media.mobile)
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  /**
   * Scroll to the current navigation segment
   */
  useEffect(() => {
    if (wrapper && index === 0 && segmentPosition === "current") {
      const getMobileScrollPoint = () =>
        // taller than 30 % of the screen?
        (wrapper?.clientHeight ?? 0) > window.innerHeight * 0.3 - 20
          ? // if yes, position relative to bottom of screen
            window.innerHeight - (wrapper?.clientHeight ?? 0) - 20
          : // otherwise, position relative to middle
            window.innerHeight * 0.7

      // gsap scroll plugin
      const updateScroll = () => {
        gsap.to(window, {
          duration: 5,
          scrollTo: {
            y: wrapper,
            offsetY: mobile ? getMobileScrollPoint() : 120,
            autoKill: true,
          },
          ease: "power3.inOut",
        })
      }
      const timeout = setTimeout(updateScroll, 3000)
      const interval = setInterval(updateScroll, 15000)
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
    return () => {}
  }, [index, mobile, segmentPosition, spokenRoute, wrapper])

  /**
   * scroll-in animation for mobile
   */
  useAnimation(() => {
    if (
      mobile &&
      (segmentPosition === "previous" || segmentPosition === "previousFollowed")
    ) {
      gsap.fromTo(wrapper, {
          y: 0,
          x: 0,
        },
        {
          y: "-70vh",
          x: 0,

          scrollTrigger: {
            trigger: ".scrollMarker",
            start: "top 70%",
            end: "bottom 70%",
            markers: true,
            scrub: 5 + index * 0.5,
          },
          ease: "power3.inOut",
        })
    }
  }, [index, mobile, segmentPosition, wrapper])

  const key = `${segmentPosition}-${segment.from.uniqueId}-${
    segment.to.uniqueId
  }${segmentPosition === "previous" ? index : ""}`
  const flipId = `${segment.from.uniqueId}-${segment.to.uniqueId}`

  return (
    <SegmentWrapper
      dark={isDark}
      active={index === 0 && !segmentPosition}
      ref={e => setWrapper(e)}
      key={key}
      data-flip-id={flipId}
      id={key}
      className={`segment ${segmentPosition}`}
    >
      <Segment forceMobile segment={segment} glassy />
    </SegmentWrapper>
  )
}

const SegmentWrapper = styled.div<{
  active: boolean
  dark: boolean
}>`
  background-color: ${({ dark }) => (dark ? "#1119" : "#eeea")};
  backdrop-filter: blur(3px);
  border-radius: 30px;
  position: relative;
  margin-top: 20px;
  > div {
    transform: none;
    opacity: 1;
  }
`
