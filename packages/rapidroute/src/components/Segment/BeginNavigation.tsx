import React, { useContext } from "react"

import { navigate } from "gatsby-link"
import styled from "styled-components"

import { SegmentType } from "components/createSegments"
import { NavigationContext } from "components/Providers/NavigationContext"
import RoundButton from "components/RoundButton"
import invertLightness from "utils/invertLightness"

interface BeginNavigationProps {
  small: boolean
  route: string[]
  segments: SegmentType[] | null
}

export default function BeginNavigation({
  small,
  route,
  segments,
}: BeginNavigationProps) {
  const { setPrefferedRoute, setCurrentRoute } = useContext(NavigationContext)

  return (
    <Wrapper>
      <Text small={small}>
        Begin <Strong>Navigation</Strong>
      </Text>
      <RoundButton
        onClick={() => {
          setPrefferedRoute(route)
          if (segments) setCurrentRoute(segments)
          navigate("/navigate")
        }}
      >
        directions_alt
      </RoundButton>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--background-green);
  color: ${invertLightness("var(--background-green)")};
  border-radius: 30px;
  padding: 30px;
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: space-between;
  transform: translate(0, 200px);
  opacity: 0;
`

const Text = styled.div<{ small: boolean }>`
  font-size: ${props => (props.small ? "20px" : "30px")};
`

const Strong = styled.strong`
  font-weight: 700;
`
