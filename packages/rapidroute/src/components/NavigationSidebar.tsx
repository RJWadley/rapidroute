import React, { useContext } from "react"

import styled from "styled-components"

import { NavigationContext } from "./Providers/NavigationContext"
import Segment from "./Segment"

export default function NavigationSidebar() {
  const { currentRoute } = useContext(NavigationContext)

  console.log(currentRoute)

  return (
    <Wrapper>
      {currentRoute.map(segment => {
        return <Segment segment={segment} key={segment.from.uniqueId} />
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  > * {
    opacity: 1;
  }
`
