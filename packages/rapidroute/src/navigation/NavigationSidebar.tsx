import React, { useContext, useRef } from "react"

import gsap from "gsap"
import ScrollToPlugin from "gsap/ScrollToPlugin"
import styled from "styled-components"

import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import media from "utils/media"

import { NavigationContext } from "../components/Providers/NavigationContext"
import ExitNavigation from "./ExitNavigation"
import NavigationSegment from "./NavigationSegment"

gsap.registerPlugin(ScrollToPlugin)

export default function NavigationSidebar() {
  const { spokenRoute } = useContext(NavigationContext)
  const wrapper = useRef<HTMLDivElement>(null)

  useNavigation()
  const followedRoute = useFollowedRoute(spokenRoute)

  return (
    <Wrapper ref={wrapper}>
      <ExitNavigation />
      {followedRoute.map((segment, i) => (
        <NavigationSegment segment={segment} previous index={i} />
      ))}
      <div className="scrollMarker" />
      {spokenRoute.map((segment, i) => (
        <NavigationSegment segment={segment} previous={false} index={i} />
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
