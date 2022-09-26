import React, { useContext, useMemo, useState } from "react"

import { Provider } from "@rapidroute/database-types"

import { SegmentType } from "components/createSegments"
import { darkModeContext } from "components/Providers/DarkMode"
import invertLightness from "utils/invertLightness"

import getProvider from "./getProvider"
import {
  Wrapper,
  Left,
  ProviderName,
  Name,
  LongNames,
  Symbols,
  GateNumber,
  Logo,
  RouteNumber,
} from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
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

export default function SingleRoute({ segment, variant }: SegmentProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const route = segment.routes[0]
  const isDark = useContext(darkModeContext)

  useMemo(() => {
    if (route) getProvider(route, setProvider)
  }, [route])

  const image =
    route?.type === "MRT"
      ? "https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png"
      : provider?.logo

  const themeColor =
    (isDark ? provider?.color?.dark : provider?.color?.light) ??
    "var(--default-card-background)"

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
    <Wrapper backgroundColor={themeColor} small={variant === "mobile"}>
      <Left>
        <ProviderName>
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
            <Name>{provider?.name ?? "Loading name..."}</Name>
            <RouteNumber>{routeNumberMessage}</RouteNumber>
          </div>
        </ProviderName>
        <LongNames>
          {segment.from.name} to <br />
          {segment.to.name}
        </LongNames>
      </Left>
      <Symbols singleLine={variant === "mobile"}>
        <div>
          {segment.from.shortName || "---"}
          {expandedFromGate && <GateNumber>{expandedFromGate}</GateNumber>}
        </div>
        <div>-&gt;</div>
        <div>
          {segment?.to?.shortName || "---"}
          {expandedToGate && <GateNumber>{expandedToGate}</GateNumber>}
        </div>
      </Symbols>
    </Wrapper>
  )
}
