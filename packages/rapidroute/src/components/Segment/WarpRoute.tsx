import React from "react"

import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"
import { Name, RouteNumber, Wrapper } from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
}

export default function WarpRoute({ segment, variant }: SegmentProps) {
  const themeColor = "#eee"

  return (
    <Warp
      backgroundColor={themeColor}
      textColor={invertLightness(themeColor)}
      small={variant === "mobile"}
    >
      <WarpIcon small={variant === "mobile"}>switch_access_shortcut</WarpIcon>
      <Name>
        Warp to {segment.to.shortName || segment.to.name || "Untitled Location"}
      </Name>
      <RouteNumber>{segment.to.name}</RouteNumber>
    </Warp>
  )
}

const Warp = styled(Wrapper)`
  grid-template-columns: min-content 1fr auto;
  align-items: center;
  gap: 0 15px;

  ${({ small }) =>
    small &&
    css`
      grid-template-columns: min-content 1fr;
    `}
`

const WarpIcon = styled.div<{ small: boolean }>`
  font-family: "Material Icons";
  font-size: ${props => (props.small ? "40px" : "60px")};
  grid-row: ${props => props.small && "span 2"};
  rotate: 90deg;
`
