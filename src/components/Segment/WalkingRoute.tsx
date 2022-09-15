import React from "react"

import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

interface SegmentProps {
  segment: SegmentType
}

export default function WalkingRoute({ segment }: SegmentProps) {
  const themeColor = "#eee"

  return (
    <Wrapper
      backgroundColor={themeColor}
      textColor={invertLightness(themeColor)}
    >
      <WalkIcon>directions_walk</WalkIcon>
      <div>
        <Name>Walk to {segment.to.shortName}</Name>
        <Number>{segment.to.name}</Number>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  backgroundColor?: string
  textColor?: string
}>`
  font-family: Inter;
  ${({ backgroundColor, textColor }) => css`
    background-color: ${backgroundColor};
    color: ${textColor};
  `}
  padding: 50px;
  border-radius: 50px;
  display: grid;
  gap: 20px;
  grid-template-columns: auto 1fr;
  align-items: center;
`

const WalkIcon = styled.div`
  font-family: "Material Icons";
  font-size: 80px;
`

const Name = styled.div`
  font-family: "Inter";
  font-weight: 700;
  font-size: 32px;
`

const Number = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
`
