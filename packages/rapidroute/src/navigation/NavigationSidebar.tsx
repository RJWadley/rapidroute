import React, { useContext, useEffect, useRef } from "react"

import gsap from "gsap"
import Flip from "gsap/Flip"
import ScrollToPlugin from "gsap/ScrollToPlugin"
import styled from "styled-components"
import { useDeepCompareEffect } from "use-deep-compare"

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
  const previousSpoken = useRef<SegmentType[]>([])
  const previousFollowed = useRef<SegmentType[]>([])
  useEffect(() => {
    if (!spokenRoute.length) return

    gsap.set(".segment.current, .segment.previous", { display: "none" })
    gsap.set(".segment.removed, .segment.previousFollowed", {
      display: "block",
    })

    setTimeout(() => {
      gsap.set(".segment.current, .segment.previous", { display: "none" })
      gsap.set(".segment.removed, .segment.previousFollowed", {
        display: "block",
      })

      const flipState = Flip.getState(".segment")

      gsap.set(".segment.current, .segment.previous", { display: "block" })
      gsap.set(".segment.removed, .segment.previousFollowed", {
        display: "none",
      })

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
            gsap.to(wrapper.current, {
              height: "auto",
            })
          }, 100)
        },
      })
    }, 1000)
  }, [spokenRoute, followedRoute])

  useDeepCompareEffect(() => {
    setTimeout(() => {
      previousSpoken.current = spokenRoute
      previousFollowed.current = followedRoute
    }, 2000)
  }, [followedRoute, spokenRoute])

  return (
    <Wrapper ref={wrapper}>
      <ExitNavigation />
      {followedRoute.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="previous"
          index={i}
          key={`previous${segment.from.uniqueId}-${segment.to.uniqueId}`}
        />
      ))}
      <div className="scrollMarker" />
      {spokenRoute.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="current"
          index={i}
          key={`current${segment.from.uniqueId}-${segment.to.uniqueId}`}
        />
      ))}
      {previousFollowed.current.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="previousFollowed"
          index={i}
          key={`previousFollowed${segment.from.uniqueId}-${segment.to.uniqueId}`}
        />
      ))}
      {previousSpoken.current.map((segment, i) => (
        <NavigationSegment
          segment={segment}
          segmentPosition="removed"
          index={i}
          key={`removed${segment.from.uniqueId}-${segment.to.uniqueId}`}
        />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 350px;
  margin: 20px;
  margin-top: 120px;
  margin-bottom: 70vh;

  @media ${media.mobile} {
    margin-top: 70vh;
    width: calc(100vw - 40px);
  }

  pointer-events: none;
  > * {
    pointer-events: auto;
  }

  .removed {
    border: 10px solid red;
  }
  .previousFollowed {
    border: 10px solid orange;
  }
  .current {
    border: 10px solid green;
  }
  .previous {
    border: 10px solid blue;
  }
`
