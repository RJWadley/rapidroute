import React from "react"

import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

import { Name, RouteNumber, Wrapper } from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
}

export default function WalkingRoute({ segment, variant }: SegmentProps) {
  const themeColor = "#eee"

  return (
    <WalkWrapper
      backgroundColor={themeColor}
      textColor={invertLightness(themeColor)}
      small={variant === "mobile"}
    >
      <WalkIcon small={variant === "mobile"}>directions_walk</WalkIcon>
      <Name>
        Walk to {segment.to.shortName || segment.to.name || "Untitled Location"}
      </Name>
      <RouteNumber>{segment.to.name}</RouteNumber>
    </WalkWrapper>
  )
}

const WalkWrapper = styled(Wrapper)`
  grid-template-columns: min-content 1fr auto;
  align-items: center;
  gap: 0 15px;

  ${({ small }) =>
    small &&
    css`
      grid-template-columns: min-content 1fr;
    `}
`

const WalkIcon = styled.div<{ small: boolean }>`
  font-family: "Material Icons";
  font-size: ${props => (props.small ? "40px" : "60px")};
  grid-row: ${props => props.small && "span 2"};
`
