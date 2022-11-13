import React, { useContext, useEffect, useRef } from "react"

import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import styled from "styled-components"

import { SegmentType } from "components/createSegments"
import { darkModeContext } from "components/Providers/DarkMode"
import Segment from "components/Segment"
import media from "utils/media"
import useMedia from "utils/useMedia"

interface NavigationSegmentProps {
  segment: SegmentType
  segmentPosition: "previous" | "current"
  index: number
}

export default function NavigationSegment({
  segment,
  segmentPosition,
  index,
}: NavigationSegmentProps) {
  const isDark = useContext(darkModeContext) ?? false
  const wrapper = useRef<HTMLDivElement>(null)
  const mobile = useMedia(media.mobile)

  const key = `${segmentPosition}-${segment.from.uniqueId}-${
    segment.to.uniqueId
  }${segmentPosition === "previous" ? index : ""}`
  const flipId = `${segment.from.uniqueId}-${segment.to.uniqueId}`

  useEffect(() => {
    if (mobile && segmentPosition === "previous") {
      gsap.delayedCall(3, () => {
        // clear transforms on wrapper
        gsap.to(wrapper.current, {
          y: 0,
        })
        ScrollTrigger.create({
          trigger: wrapper.current,
          start: "top 61%",
          end: "bottom+=20 61%",
          onLeave: () => {
            gsap.to(wrapper.current, {
              y: "-60vh",
              yPercent: -100,
              duration: 1,
              ease: "power3.in"
            })
          },
          onEnterBack: () => {
            gsap.to(wrapper.current, {
              y: 0,
              yPercent: 0,
              duration: 1,
              ease: "power3.out"
            })
          },
        })
      })
    }
  }, [key, mobile, segmentPosition])

  return (
    <SegmentWrapper
      dark={isDark}
      active={index === 0 && !segmentPosition}
      key={key}
      data-flip-id={flipId}
      id={key}
      className={`segment ${segmentPosition}`}
      ref={wrapper}
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
  z-index: 2;
  margin-top: 20px;
  > div {
    transform: none;
    opacity: 1;
  }
`
