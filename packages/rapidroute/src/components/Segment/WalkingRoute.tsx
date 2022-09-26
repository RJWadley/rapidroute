import React from "react"

import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"

import { Name, RouteNumber, Wrapper } from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
}

export default function WalkingRoute({ segment, variant }: SegmentProps) {
  const themeColor = "var(--default-card-background)"

  const name =
    segment.to.type === "City"
      ? segment.to.name || "Untitled Location"
      : segment.to.shortName || segment.to.name || "Untitled Location"
  const detail =
    segment.to.type === "City" ? segment.to.shortName : segment.to.name

  const isTransfer =
    segment.to.type === "MRT Station" && segment.from.type === "MRT Station"

  return (
    <WalkWrapper backgroundColor={themeColor} small={variant === "mobile"}>
      <WalkIcon small={variant === "mobile"}>
        {isTransfer ? "transfer_within_a_station" : "directions_walk"}
      </WalkIcon>
      <Name>
        {isTransfer ? "Transfer" : "Walk"} to {name}
      </Name>
      <RouteNumber>{detail}</RouteNumber>
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
