import React, { useMemo, useState } from "react"

import { Provider, Route } from "@rapidroute/database-types"
import styled, { css } from "styled-components"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

import getProvider from "./getProvider"

interface MultiSingleBitProps {
  segment: SegmentType
  route: Route
}

export default function MultiSingleBit({
  segment,
  route,
}: MultiSingleBitProps) {
  const [provider, setProvider] = useState<Provider | null>(null)

  useMemo(() => {
    getProvider(route, setProvider)
  }, [route])

  const image =
    route?.type === "MRT"
      ? "https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png"
      : provider?.logo
  const themeColor = provider?.color?.light ?? "#eeeeee"
  const rawFromGate = route?.locations[segment.from.uniqueId] ?? null
  const fromGate = rawFromGate === "none" ? null : rawFromGate
  const expandedFromGate = fromGate?.includes("T")
    ? fromGate.split(" ").join(" Gate ").replace("T", "Terminal ")
    : `Gate ${fromGate}`

  let routeNumberMessage = ""
  if (route.number)
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
        {fromGate && <GateNumber>{expandedFromGate}</GateNumber>}
      </ProviderName>
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
  padding: 20px;
  border-radius: 30px;
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

const GateNumber = styled.div`
  font-size: 20px;
  font-weight: normal;
`
