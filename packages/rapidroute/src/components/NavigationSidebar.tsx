import React, { useContext } from "react"

import { navigate } from "gatsby-link"
import styled from "styled-components"

import useFollowedRoute from "navigation/useFollowedRoute"
import useNavigation from "navigation/useNavigation"

import { NavigationContext } from "./Providers/NavigationContext"
import Segment from "./Segment"

export default function NavigationSidebar() {
  const { currentRoute, spokenRoute } = useContext(NavigationContext)

  if (currentRoute.length === 0) navigate("/")

  useNavigation()
  const followedRoute = useFollowedRoute(spokenRoute)

  return (
    <Wrapper>
      {followedRoute.map(segment => {
        return (
          <Segment forceMobile segment={segment} key={segment.to.uniqueId} />
        )
      })}
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
  display: grid;
  padding: 25px;
  gap: 25px;
`
