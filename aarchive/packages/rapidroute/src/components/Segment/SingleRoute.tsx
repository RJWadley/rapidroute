import { Provider } from "@rapidroute/database-utils"
import { darkModeContext } from "components/Providers/DarkMode"
import { SegmentType } from "components/Segment/createSegments"
import { useContext, useMemo, useState } from "react"
import styled from "styled-components"
import invertLightness from "utils/invertLightness"
import media from "utils/media"

import { getLineDirection } from "./getLineDirections"
import getProvider from "./getProvider"
import {
  GateNumber,
  Left,
  Logo,
  LongNames,
  Name,
  ProviderName,
  RouteNumber,
  Symbols,
  Wrapper,
} from "./sharedComponents"

interface SegmentProps {
  segment: SegmentType
  variant: "mobile" | "desktop"
  forceMobile: boolean
  glassy?: boolean
}

export const expandGate = (gateString: string | null | undefined) => {
  const toGate = gateString === "none" ? null : gateString
  if (!toGate) return null
  if (
    toGate.toLowerCase().includes("terminal") ||
    toGate.toLowerCase().includes("gate")
  )
    return toGate
  return /T/g.test(toGate)
    ? toGate.split(" ").join(" Gate ").replace(/T/g, "Terminal ")
    : `Gate ${toGate}`
}

export default function SingleRoute({
  segment,
  variant,
  forceMobile,
  glassy = false,
}: SegmentProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const route = segment.routes[0]
  const isDark = useContext(darkModeContext)

  useMemo(() => {
    if (route)
      getProvider(route)
        .then(p => p && setProvider(p))
        .catch(error => {
          console.error("Error getting provider info", error)
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
  const glassyThemeColor =
    provider?.color?.light || provider?.color?.dark
      ? `${themeColor}CC`
      : "var(--glassy-default-card-background)"

  const expandedToGate = expandGate(route?.places[segment.to.uniqueId])
  const expandedFromGate = expandGate(route?.places[segment.from.uniqueId])

  let routeNumberMessage = ""
  switch (route?.type) {
    case "flight":
      routeNumberMessage = `Flight ${route.number ?? ""}`
      break

    case "heli":
      routeNumberMessage = `Helicopter Flight ${route.number ?? ""}`
      break

    case "seaplane":
      routeNumberMessage = `Seaplane Flight ${route.number ?? ""}`
      break

    default:
      routeNumberMessage = ""
  }

  const letterCode = route?.type === "MRT" && provider?.name.charAt(1)
  const providerName =
    route?.type === "MRT" ? provider?.name.slice(3) : provider?.name

  const isMobile = variant === "mobile" || forceMobile

  return (
    <Wrapper
      backgroundColor={glassy ? glassyThemeColor : themeColor}
      small={isMobile}
    >
      <Left>
        <ProviderName>
          {image && (
            <Logo
              bigLogo={route?.type === "MRT"}
              background={invertLightness(themeColor)}
              small={isMobile}
            >
              <img
                src={image}
                alt={`${provider?.name ?? "placeholder"} logo`}
              />
            </Logo>
          )}
          <div>
            <Name>
              {letterCode && (
                <Box $color={invertLightness(themeColor)}>{letterCode}</Box>
              )}
              {providerName ?? "Loading name..."}
            </Name>
            <RouteNumber>{routeNumberMessage}</RouteNumber>
          </div>
        </ProviderName>
        <LongNames>
          {segment.from.name}{" "}
          {route?.type === "MRT" &&
            getLineDirection(segment.from.shortName, segment.to.shortName)}{" "}
          to <br />
          {segment.to.name}
        </LongNames>
      </Left>
      <Symbols singleLine={isMobile}>
        <div>
          {segment.from.shortName || "---"}
          {expandedFromGate && <GateNumber>{expandedFromGate}</GateNumber>}
        </div>
        <div>-&gt;</div>
        <div>
          {segment.to.shortName || "---"}
          {expandedToGate && <GateNumber>{expandedToGate}</GateNumber>}
        </div>
      </Symbols>
    </Wrapper>
  )
}

const Box = styled.span<{ $color: string }>`
  display: inline-flex;
  border: 3px solid ${({ color }) => color};
  padding: 2px;
  margin-right: 5px;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;

  @media ${media.mobile} {
    width: 30px;
    height: 30px;
    border-width: 2px;
    border-radius: 8px;
  }
`