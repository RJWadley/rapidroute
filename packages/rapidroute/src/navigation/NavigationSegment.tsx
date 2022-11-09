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
  previous: boolean
  index: number
}

export default function NavigationSegment({
  segment,
  previous,
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
    const getMobileScrollPoint = () =>
      // taller than 30 % of the screen?
      (wrapper?.clientHeight ?? 0) > window.innerHeight * 0.3 - 20
        ? // if yes, position relative to bottom of screen
          window.innerHeight - (wrapper?.clientHeight ?? 0) - 20
        : // otherwise, position relative to middle
          window.innerHeight * 0.7

    // gsap scroll plugin
    const updateScroll = () => {
      if (wrapper && index === 0 && !previous)
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
    updateScroll()
    const interval = setInterval(updateScroll, 15000)
    return () => clearInterval(interval)
  }, [index, mobile, previous, spokenRoute, wrapper])

  /**
   * scroll-in animation for mobile
   */
  useAnimation(() => {
    gsap.delayedCall(0.5, () => {
      if (!mobile || !previous) return

      gsap.to(wrapper, {
        y: "-70vh",
        scrollTrigger: {
          trigger: ".scrollMarker",
          start: "top 70%",
          end: "bottom 70%",
          scrub: 2 + index * 0.5,
        },
        ease: "power3.inOut",
      })
    })
  }, [index, mobile, previous, wrapper])

  const key = `${segment.from.uniqueId}${segment.to.uniqueId}${index}${
    previous ? "previous" : "next"
  }`

  useEffect(() => {
    if (wrapper) gsap.set(wrapper.children, { autoAlpha: 1, y: 0 })
  }, [wrapper])

  return (
    <SegmentWrapper
      dark={isDark}
      active={index === 0 && !previous}
      ref={e => setWrapper(e)}
      key={key}
      data-flip-id={key}
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
`
