import { SegmentType } from "components/Segment/createSegments"
import styled, { css } from "styled-components"

import { Name, RouteNumber, Wrapper } from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
  forceMobile: boolean
}

export default function WarpRoute({
  segment,
  variant,
  forceMobile,
}: SegmentProps) {
  const themeColor = "var(--default-card-background)"

  const isMobile = variant === "mobile" || forceMobile

  return (
    <Warp backgroundColor={themeColor} small={isMobile}>
      <WarpIcon small={isMobile}>switch_access_shortcut</WarpIcon>
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
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
  font-size: var(--symbol);
  grid-row: ${props => props.small && "span 2"};
  rotate: 90deg;
`
