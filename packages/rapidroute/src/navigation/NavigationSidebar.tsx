import React, { useContext, useEffect, useRef } from "react"

import styled from "styled-components"

import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"

import { NavigationContext } from "../components/Providers/NavigationContext"
import Segment from "../components/Segment"
import Countdown from "./Countdown"

export default function NavigationSidebar() {
  const { spokenRoute, preferredRoute } = useContext(NavigationContext)
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
      {followedRoute.map(segment => {
        return (
          <Segment forceMobile segment={segment} key={segment.to.uniqueId} />
        )
      })}
      <div ref={scrollMarker} />
      <Countdown />
      {spokenRoute.map(segment => {
        return (
          <Segment forceMobile segment={segment} key={segment.to.uniqueId} />
        )
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  > * {
    opacity: 1;
    transform: none;
  }
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 25px;
  gap: 25px;
`
