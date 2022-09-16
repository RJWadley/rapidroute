import React, { useMemo, useState } from "react"

import { Provider } from "@rapidroute/database-types"
import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

import getProvider from "./getProvider"

interface SegmentProps {
  segment: SegmentType
}

export const expandGate = (gateString: string | null | undefined) => {
  const toGate = gateString === "none" ? null : gateString
  if (!toGate) return null
  if (
    toGate?.toLowerCase().includes("terminal") ||
    toGate?.toLowerCase().includes("gate")
  )
    return toGate
  const expandedToGate = toGate.match(/Tt/g)
    ? toGate.split(" ").join(" Gate ").replace(/Tt/g, "Terminal ")
    : `Gate ${toGate}`
  return expandedToGate
}

export default function SingleRoute({ segment }: SegmentProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const route = segment.routes[0]

  useMemo(() => {
    if (route) getProvider(route, setProvider)
  }, [route])

  const image =
    route?.type === "MRT"
      ? "https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png"
      : provider?.logo
  const themeColor = provider?.color?.light ?? "#eeeeee"

  const expandedToGate = expandGate(route?.locations[segment.to.uniqueId])
  const expandedFromGate = expandGate(route?.locations[segment.from.uniqueId])

  let routeNumberMessage = ""
  switch (route?.type) {
    case "flight":
      routeNumberMessage = `Flight ${route?.number ?? ""}`
      break
    case "heli":
      routeNumberMessage = `Helicopter Flight ${route?.number ?? ""}`
      break
    case "seaplane":
      routeNumberMessage = `Seaplane Flight ${route?.number ?? ""}`
      break
    default:
      routeNumberMessage = ""
  }

  return (
    <Wrapper
      backgroundColor={themeColor}
      textColor={invertLightness(themeColor)}
    >
      <ProviderName>
        {image && (
          <Image
            bigLogo={route?.type === "MRT"}
            background={invertLightness(themeColor)}
          >
            <img src={image} alt={`${provider?.name} logo`} />
          </Image>
        )}
        <div>
          <Name>{provider?.name}</Name>
          <Number>{routeNumberMessage}</Number>
        </div>
        <LongNames>
          {segment.from.name} to <br />
          {segment.to.name}
        </LongNames>
      </ProviderName>

      <Symbols>
        <div>
          {segment.from.shortName || "---"}
          {expandedFromGate && <GateNumber>{expandedFromGate}</GateNumber>}
        </div>
        <div>-&gt;</div>
        <div>
          {expandedToGate && <GateNumber>{expandedToGate}</GateNumber>}
          {segment?.to?.shortName || "---"}
        </div>
      </Symbols>
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

const ProviderName = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
`

const Image = styled.div<{ bigLogo: boolean; background: string }>`
  border-radius: 10px;
  background-color: ${({ background }) => background};
  width: 80px;
  height: 80px;

  img {
    ${props =>
      props.bigLogo
        ? css`
            border-radius: 10px;
          `
        : css`
            margin: 5px;
            width: 70px;
            height: 70px;
          `}
  }
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

const LongNames = styled.div`
  text-align: right;
`

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

const GateNumber = styled.div`
  font-size: 20px;
  font-weight: normal;
`
