import { SegmentType } from "components/createSegments"
import getProvider from "components/Segment/getProvider"
import { expandGate } from "components/Segment/SingleRoute"

const westEastLines = ["X", "N", "S", "L"]
const northSouthLines = ["Z", "E", "J", "W"]
const inOutLines = ["A", "T", "I", "M", "D", "P", "V", "H", "F"]
const circleLines = ["C"]

export const stopToNumber = (stop: string | undefined) => {
  if (!stop) return 0

  if (stop[1] === "X") return -1
  if (stop === "MH") return -0.3
  if (stop === "MW") return -0.2

  return parseInt(stop.replace(/\D/g, ""), 10)
}

const getLineDirection = (fromStop: string, toStop: string) => {
  const lineCode = fromStop[0]
  const lineModifier = fromStop[1]
  const toLineModifier = toStop[1]

  const fromStopNumber = stopToNumber(fromStop)
  const toStopNumber = stopToNumber(toStop)

  const fromIsBigger = fromStopNumber > toStopNumber

  if (westEastLines.includes(lineCode)) {
    if (lineModifier === "E") {
      return fromIsBigger ? "east" : "west"
    }
    if (lineModifier === "W") {
      return fromIsBigger ? "west" : "east"
    }
    return toLineModifier === "E" ? "east" : "west"
  }
  if (northSouthLines.includes(lineCode)) {
    if (lineModifier === "N") {
      return fromIsBigger ? "south" : "north"
    }
    if (lineModifier === "S") {
      return fromIsBigger ? "north" : "south"
    }
    return toLineModifier === "N" ? "north" : "south"
  }
  if (inOutLines.includes(lineCode)) {
    return fromIsBigger ? "inbound" : "outbound"
  }
  if (circleLines.includes(lineCode)) {
    return fromIsBigger ? "counterclockwise" : "clockwise"
  }
  return ""
}

export default async function getNavigationInstruction(
  segment: SegmentType | undefined
) {
  if (!segment) return undefined

  // WALKING
  if (!segment.routes.length)
    return `${
      segment.from.type === "MRT Station" && segment.to.type === "MRT Station"
        ? "transfer"
        : "walk"
    } to ${segment.to.shortName}, ${segment.to.name}`

  // MRT Lines
  if (segment.routes[0]?.type === "MRT") {
    const route = segment.routes[0]
    return `take the ${route.provider} line ${getLineDirection(
      segment.from.uniqueId,
      segment.to.uniqueId
    )} to ${segment.to.shortName}, ${segment.to.name}`
  }

  if (segment.from.type === "Airport" && segment.to.type === "Airport") {
    // Single flight
    if (segment.routes.length === 1) {
      const routeInfo = segment.routes[0]
      if (!routeInfo) return undefined
      const gate = expandGate(routeInfo?.locations[segment.from.uniqueId])
      const flightNumber = routeInfo?.number
      const provider = await getProvider(routeInfo)
      const providerName = provider?.name
      return `take ${providerName ?? "a"} flight ${flightNumber ?? ""} to ${
        segment.to.shortName
      }, ${segment.to.name} ${gate ? `at ${gate}` : ""}`
    }

    // Multiple flights
    let output = `take any flight to ${segment.to.shortName}. You have the following options:`
    const addToList = (
      last: boolean,
      providerName: string,
      number: string | number,
      gate?: string | null
    ) => {
      output += `${last ? "And," : ""} ${providerName} flight ${number} ${
        gate ? `at ${gate}` : ""
      }. `
    }
    const proms: Promise<unknown>[] = []
    for (let i = 0; i < segment.routes.length; i += 1) {
      const routeInfo = segment.routes[i]
      if (!routeInfo) return undefined
      const gate = expandGate(routeInfo?.locations[segment.from.uniqueId])
      const flightNumber = routeInfo?.number
      const provider = getProvider(routeInfo)
      proms.push(provider)
      provider.then(providerName => {
        addToList(
          i === segment.routes.length - 1,
          providerName?.name ?? "",
          flightNumber ?? "",
          gate
        )
      })
    }
    await Promise.all(proms)
    return output
  }

  return `navigate from ${segment.from.shortName}, ${segment.from.name}, to 
  ${segment.to.shortName}, ${segment.to.name}`
}
