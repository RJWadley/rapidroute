import React from "react"

import { Location } from "@rapidroute/database-types"
import styled from "styled-components"

interface WillArriveProps {
  small: boolean
  destination: Location
}

export default function WillArrive({ small, destination }: WillArriveProps) {
  return (
    <Wrapper>
      <Icon small={small}>check</Icon>
      <Text small={small}>
        You will arrive at <br />
        <Strong>{destination.name}</Strong>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--background-green);
  border-radius: 30px;
  padding: 30px;
  display: flex;
  gap: 30px;
  align-items: center;
`

const Icon = styled.div<{ small: boolean }>`
  font-family: "Material Icons";
  font-size: ${props => (props.small ? "40px" : "60px")};
  grid-row: ${props => props.small && "span 2"};
`

const Text = styled.div<{ small: boolean }>`
  font-size: ${props => (props.small ? "20px" : "30px")};
`

const Strong = styled.strong`
  font-weight: 700;
`
