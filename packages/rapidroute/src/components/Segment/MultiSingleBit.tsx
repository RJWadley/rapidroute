import { useContext, useMemo, useState } from "react"

import { Provider, Route } from "@rapidroute/database-types"
import styled, { css } from "styled-components"

import { darkModeContext } from "components/Providers/DarkMode"
import { SegmentType } from "components/Segment/createSegments"
import invertLightness from "utils/invertLightness"

import getProvider from "./getProvider"
import { Logo, Name, RouteNumber, GateNumber } from "./sharedComponents"
import { expandGate } from "./SingleRoute"

interface MultiSingleBitProps {
  segment: SegmentType
  route: Route
  variant: "mobile" | "desktop"
}

/**
 * a single route in a multi-route segment
 */
export default function MultiSingleBit({
  segment,
  route,
  variant,
}: MultiSingleBitProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const isDark = useContext(darkModeContext)

  useMemo(() => {
    getProvider(route)
      .then(p => p && setProvider(p))
      .catch(e => {
        console.error("Error getting provider info", e)
        setProvider(null)
      })
  }, [route])

  const image =
    route?.type === "MRT"
      ? "https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png"
      : provider?.logo
  const themeColor =
    (isDark ? provider?.color?.dark : provider?.color?.light) ??
    "var(--default-card-background)"

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
          <img src={image} alt={`${provider?.name || "placeholder"} logo`} />
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
    font-size: var(--extra-small);
  }
`
