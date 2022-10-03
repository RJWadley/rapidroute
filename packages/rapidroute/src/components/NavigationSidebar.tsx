import React, { useContext } from "react"

import { navigate } from "gatsby-link"
import styled from "styled-components"

import useNavigation from "navigation/useNavigation"

import { NavigationContext } from "./Providers/NavigationContext"
import Segment from "./Segment"

export default function NavigationSidebar() {
  const { currentRoute } = useContext(NavigationContext)

  if (currentRoute.length === 0) navigate("/")

  useNavigation()

  return (
    <Wrapper>
      {currentRoute.map(segment => {
        return (
          <Segment forceMobile segment={segment} key={segment.from.uniqueId} />
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
