import React, { useContext,  } from "react"

import styled from "styled-components"

import { SegmentType } from "components/createSegments"
import { darkModeContext } from "components/Providers/DarkMode"
import Segment from "components/Segment"

interface NavigationSegmentProps {
  segment: SegmentType
  segmentPosition: "previous" | "current"
  index: number
}

export default function NavigationSegment({
  segment,
  segmentPosition,
  index,
}: NavigationSegmentProps) {
  const isDark = useContext(darkModeContext) ?? false
 
  const key = `${segmentPosition}-${segment.from.uniqueId}-${
    segment.to.uniqueId
  }${segmentPosition === "previous" ? index : ""}`
  const flipId = `${segment.from.uniqueId}-${segment.to.uniqueId}`

  return (
    <SegmentWrapper
      dark={isDark}
      active={index === 0 && !segmentPosition}
      key={key}
      data-flip-id={flipId}
      id={key}
      className={`segment ${segmentPosition}`}
    >
      <Segment forceMobile segment={segment} glassy />
    </SegmentWrapper>
  )
}

const SegmentWrapper = styled.div<{
  active: boolean
  dark: boolean
}>`
  background-color: ${({ dark }) => (dark ? "#1119" : "#eeea")};
  backdrop-filter: blur(3px);
  border-radius: 30px;
  position: relative;
  margin-top: 20px;
  > div {
    transform: none;
    opacity: 1;
  }

  &.previous {
    background: none;
    backdrop-filter: none;
    > div {
      transform: translate(0, 0);
      :before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${({ dark }) => (dark ? "#1119" : "#eeea")};
        backdrop-filter: blur(3px);
        border-radius: 30px;
        z-index: -1;
      }
    }
  }
`
