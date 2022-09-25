import React from "react"

import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

import MultiSingleBit from "./MultiSingleBit"
import { Left, LongNames, Symbols, Wrapper } from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
}

export default function MultiRoute({ segment, variant }: SegmentProps) {
  const themeColor = "#eee"
  return (
    <Wrapper
      backgroundColor={themeColor}
      textColor={invertLightness(themeColor)}
      small={variant === "mobile"}
    >
      <Left>
        {segment.routes.map(
          route =>
            route && (
              <MultiSingleBit
                key={route?.uniqueId}
                route={route}
                segment={segment}
                variant={variant}
              />
            )
        )}
      </Left>
      <Right bumpToFront={variant === "mobile"}>
        <Symbols singleLine={false}>
          <div>{segment.from.shortName || "---"}</div>
          <div>-&gt;</div>
          <div>{segment?.to?.shortName || "---"}</div>
        </Symbols>
        <LongNames>
          {segment.from.name} to <br />
          {segment.to.name}
        </LongNames>
      </Right>
    </Wrapper>
  )
}

const Right = styled.div<{ bumpToFront?: boolean }>`
  ${({ bumpToFront }) =>
    bumpToFront &&
    css`
      order: -1;
      display: grid;
      gap: 10px;
    `}
`
