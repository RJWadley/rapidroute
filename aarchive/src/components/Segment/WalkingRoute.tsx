import { SegmentType } from "components/Segment/createSegments"
import { getDistance } from "pathfinding/findPath/pathUtil"
import styled, { css } from "styled-components"

import { Name, RouteNumber, Wrapper } from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
  forceMobile: boolean
  glassy?: boolean
}

export default function WalkingRoute({
  segment,
  variant,
  forceMobile,
  glassy = false,
}: SegmentProps) {
  const themeColor = glassy
    ? "var(--glassy-default-card-background)"
    : "var(--default-card-background)"

  const name =
    segment.to.type === "City"
      ? segment.to.name || "Untitled Location"
      : segment.to.shortName || segment.to.name || "Untitled Location"
  const detail =
    segment.to.type === "City" ? segment.to.shortName : segment.to.name

  const isTransfer =
    segment.to.type === "MRT Station" &&
    segment.from.type === "MRT Station" &&
    getDistance(
      segment.from.coords?.x ?? Infinity,
      segment.from.coords?.z ?? Infinity,
      segment.to.coords?.x ?? Infinity,
      segment.to.coords?.z ?? Infinity
    ) < 200

  const isMobile = variant === "mobile" || forceMobile

  return (
    <WalkWrapper backgroundColor={themeColor} small={isMobile}>
      <WalkIcon small={isMobile}>
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
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
  font-size: var(--symbol);
  ${({ small }) =>
    small &&
    css`
      grid-row: span 2;
      height: 50px;
      width: 40px;
    `};
`
