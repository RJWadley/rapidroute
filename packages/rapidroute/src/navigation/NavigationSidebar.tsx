import React, { useContext, useEffect, useRef } from "react"

import styled from "styled-components"

import { darkModeContext } from "components/Providers/DarkMode"
import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import media from "utils/media"

import { NavigationContext } from "../components/Providers/NavigationContext"
import Segment from "../components/Segment"
import Countdown from "./Countdown"
import ExitNavigation from "./ExitNavigation"

export default function NavigationSidebar() {
  const { spokenRoute, preferredRoute } = useContext(NavigationContext)
  const isDark = useContext(darkModeContext)
  const scrollMarker = useRef<HTMLDivElement>(null)

  if (isBrowser() && preferredRoute.length === 0) {
    loadRoute("/")
  }

  useNavigation()
  const followedRoute = useFollowedRoute(spokenRoute)

  useEffect(() => {
    if (scrollMarker.current) {
      scrollMarker.current.scrollIntoView({
        behavior: "smooth",
      })
    }
  }, [followedRoute, spokenRoute])

  return (
    <Wrapper>
      <ExitNavigation />
      {followedRoute.map((segment, i) => {
        return (
          <SegmentWrapper
            active={false}
            key={`${segment.to.uniqueId}-${i + 1}`}
            dark={isDark ?? false}
          >
            <Segment forceMobile segment={segment} glassy />
          </SegmentWrapper>
        )
      })}
      {spokenRoute.map((segment, i) => {
        return (
          <SegmentWrapper
            active={i === 0}
            key={segment.to.uniqueId}
            dark={isDark ?? false}
          >
            {i === 0 && <div ref={scrollMarker} />}
            <Countdown show={i === 0} type={segment.routes[0]?.type} />
            <Segment forceMobile segment={segment} glassy />
          </SegmentWrapper>
        )
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  position: fixed;
  left: 20px;
  bottom: 0;
  top: 0;
  padding-top: 120px;
  padding-bottom: 20px;
  width: 350px;
  z-index: 1;

  // hide scrollbar
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media ${media.mobile} {
    width: calc(100vw - 40px);
    padding-top: 50vh
  }
`

const SegmentWrapper = styled.div<{
  active: boolean
  dark: boolean
}>`
  background-color: ${({ dark }) => (dark ? "#1119" : "#eeea")};
  backdrop-filter: blur(3px);
  border-radius: 30px;
  position: relative;

  padding-top: ${({ active }) => (active ? "50px" : "0px")};
  transition: padding-top 0.5s ease-in-out;

  > div:last-child {
    opacity: 1;
    transform: none;
  }
`
