import React from "react"

import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

import MultiSingleBit from "./MultiSingleBit"

interface SegmentProps {
  segment: SegmentType
}

export default function MultiRoute({ segment }: SegmentProps) {
  const themeColor = "#eee"
  return (
    <Wrapper
      backgroundColor={themeColor}
      textColor={invertLightness(themeColor)}
    >
      <LongNames>
        {segment.from.name} to <br />
        {segment.to.name}
      </LongNames>
      <Symbols>
        <div>{segment.from.shortName || "---"}</div>
        <div>-&gt;</div>
        <div>{segment?.to?.shortName || "---"}</div>
      </Symbols>
      {segment.routes.map(
        route =>
          route && (
            <MultiSingleBit
              key={route?.uniqueId}
              route={route}
              segment={segment}
            />
          )
      )}
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
`

const LongNames = styled.div``

const Symbols = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 48px;
  font-weight: 700;

  > div {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  > div:last-child {
    text-align: right;
  }
`
