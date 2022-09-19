import React, { useMemo, useState } from "react"

import { Provider, Route } from "@rapidroute/database-types"

import { SegmentType } from "components/createSegments"
import invertLightness from "utils/invertLightness"

import styled, { css } from "styled-components"
import getProvider from "./getProvider"
import { expandGate } from "./SingleRoute"
import { Logo, Name, RouteNumber, GateNumber } from "./sharedComponents"

interface MultiSingleBitProps {
  segment: SegmentType
  route: Route
  variant: "mobile" | "desktop"
}

export default function MultiSingleBit({
  segment,
  route,
  variant,
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

  const expandedFromGate = expandGate(route?.locations[segment.from.uniqueId])
  const expandedToGate = expandGate(route?.locations[segment.to.uniqueId])

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
      small={variant === "mobile"}
    >
      {image && (
        <Logo
          bigLogo={route?.type === "MRT"}
          background={invertLightness(themeColor)}
          small={variant === "mobile"}
        >
          <img src={image} alt={`${provider?.name} logo`} />
        </Logo>
      )}
      <div>
        <Name>{provider?.name ?? "Loading Name..."}</Name>
        <RouteNumber>{routeNumberMessage}</RouteNumber>
      </div>
      {(expandedFromGate || expandedToGate) && (
        <div>
          <GateNumber>{expandedFromGate ?? "No Gate"}</GateNumber>
          <GateNumber>{expandedToGate ?? "No Gate"}</GateNumber>
        </div>
      )}
    </Wrapper>
  )
}

export const Wrapper = styled.div<{
  backgroundColor: string
  textColor: string
  small: boolean
}>`
  ${({ backgroundColor, textColor }) => css`
    background-color: ${backgroundColor};
    color: ${textColor};
  `}
  transition: background-color 0.2s, color 0.2s;
  padding: 10px;
  border-radius: ${({ small }) => (small ? "15px" : "20px")};
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;

  ${GateNumber} {
    text-align: right;
    font-size: ${({ small }) => (small ? "12px" : "16px")};
  }
`