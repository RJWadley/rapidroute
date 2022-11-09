import React, { useContext, useEffect, useRef } from "react"

import gsap from "gsap"
import Flip from "gsap/Flip"
import ScrollToPlugin from "gsap/ScrollToPlugin"
import styled from "styled-components"

import { SegmentType } from "components/createSegments"
import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import media from "utils/media"

import { NavigationContext } from "../components/Providers/NavigationContext"
import ExitNavigation from "./ExitNavigation"
import NavigationSegment from "./NavigationSegment"

gsap.registerPlugin(ScrollToPlugin, Flip)

export default function NavigationSidebar() {
  const { spokenRoute } = useContext(NavigationContext)
  const wrapper = useRef<HTMLDivElement>(null)

  useNavigation()
  const followedRoute = useFollowedRoute(spokenRoute)

  /**
   * flip in the new segments and out the old
   */
  const previousSegments = useRef<SegmentType[]>([])
  useEffect(() => {
    if (!spokenRoute.length) return

    gsap.set(".segment.current", { display: "none" })
    gsap.set(".segment.removed", { display: "block" })

    const flipState = Flip.getState(".segment")

    gsap.set(".segment.current", { display: "block" })
    gsap.set(".segment.removed", { display: "none" })
    gsap.set(wrapper.current, {
      height: wrapper.current?.clientHeight,
    })

    Flip.from(flipState, {
      targets: ".segment",
      duration: 1,
      absolute: true,
      stagger: 0.1,
      onEnter: el =>
        gsap.fromTo(el, { xPercent: -150 },
          { xPercent: 0, duration: 1, stagger: 0.1 }),
      onLeave: el =>
        gsap.fromTo(el, { xPercent: 0 },
          { xPercent: -150, duration: 1, stagger: 0.1 }),
      onComplete: () => {
        setTimeout(() => {
          previousSegments.current = spokenRoute
          gsap.set(".segment.removed", { display: "none" })
          gsap.to(wrapper.current, {
            height: "auto",
          })
        }, 100)
      },
    })
  }, [spokenRoute, followedRoute])

  return (
    <Wrapper ref={wrapper}>
      <ExitNavigation />
      {followedRoute.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="previous"
          index={i}
        />
      ))}
      <div className="scrollMarker" />
      {spokenRoute.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="current"
          index={i}
        />
      ))}
      {previousSegments.current.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="removed"
          index={i}
        />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 350px;
  margin: 20px;

  @media ${media.mobile} {
    width: calc(100vw - 40px);
  }

  pointer-events: none;
  > * {
    pointer-events: auto;
  }
`
