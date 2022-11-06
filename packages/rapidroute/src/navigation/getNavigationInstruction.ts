import { SegmentType } from "components/createSegments"
import getProvider from "components/Segment/getProvider"
import { expandGate } from "components/Segment/SingleRoute"

const westEastLines = ["X", "N", "S", "L"]
const northSouthLines = ["Z", "E", "J", "W"]
const inOutLines = ["A", "T", "I", "M", "D", "P", "V", "H", "F"]
const circleLines = ["C"]

/**
 * takes a the name of an MRT station and returns the number of the
 * station or its numerical position, for determining travel direction
 * @param stop the name of the station
 * @returns the number of the station or its numerical position (relative to the other stations on the same line)
 */
export const stopToNumber = (stop: string | undefined) => {
  if (!stop) return 0

  if (stop[1] === "X") return -1
  if (stop === "MH") return -0.3
  if (stop === "MW") return -0.2

  // remove all non-numeric characters, then parse the number
  return parseInt(stop.replace(/\D/g, ""), 10)
}

/**
 * given two MRT stations, return the direction of travel between them (according to in-game signs)
 * @param fromStop the name of the station the player is currently at
 * @param toStop the name of the station the player is traveling to
 * @returns the direction of travel between the two stations
 */
const getLineDirection = (fromStop: string, toStop: string) => {
  const lineCode = fromStop[0]
  const lineModifier = fromStop[1]
  const toLineModifier = toStop[1]

  const fromStopNumber = stopToNumber(fromStop)
  const toStopNumber = stopToNumber(toStop)
  const fromIsBigger = fromStopNumber > toStopNumber

  /**
   * handle east-west lines
   */
  if (westEastLines.includes(lineCode)) {
    if (lineModifier === "E") {
      return fromIsBigger ? "east" : "west"
    }
    if (lineModifier === "W") {
      return fromIsBigger ? "west" : "east"
    }
    return toLineModifier === "E" ? "east" : "west"
  }

  /**
   * handle north-south lines
   */
  if (northSouthLines.includes(lineCode)) {
    if (lineModifier === "N") {
      return fromIsBigger ? "south" : "north"
    }
    if (lineModifier === "S") {
      return fromIsBigger ? "north" : "south"
    }
    return toLineModifier === "N" ? "north" : "south"
  }

  /**
   * handle inbound/outbound lines
   */
  if (inOutLines.includes(lineCode)) {
    return fromIsBigger ? "inbound" : "outbound"
  }

  /**
   * handle circle lines
   */
  if (circleLines.includes(lineCode)) {
    return fromIsBigger ? "counterclockwise" : "clockwise"
  }

  // if we get here, we don't know the direction
  return ""
}

export default async function getNavigationInstruction(
  segment: SegmentType | undefined
) {
  if (!segment) return undefined

  /**
   * Instructions for walking to a location
   * If we're transferring, say "Transfer to <line> at <station>"
   * otherwise, say "Walk to <station>"
   */
  if (!segment.routes.length) 
    return `${
      segment.from.type === "MRT Station" && segment.to.type === "MRT Station"
        ? "transfer"
        : "walk"
    } to ${segment.to.shortName}, ${segment.to.name}`

  /**
   * Instructions for riding an MRT line
   * Say "Take the <name> line <direction> to <station>"
   */
  if (segment.routes[0]?.type === "MRT") {
    const route = segment.routes[0]
    return `take the ${route.provider} line ${getLineDirection(
      segment.from.uniqueId,
      segment.to.uniqueId
    )} to ${segment.to.shortName}, ${segment.to.name}`
  }

  /**
   * Instructions for taking a flight
   * The instructions will vary depending on the number of flights
   */
  if (segment.from.type === "Airport" && segment.to.type === "Airport") {
    /**
     * If we're taking a single flight, say "Take <provider> flight <number> to <airport> at <gate>"
     */
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

    /**
     * If there are multiple flights, first say the destination airport, then
     * list the number of flights and information about each flight
     */
    let output = `take any flight to ${segment.to.shortName}. You have ${
      segment.routes.length
    } options:`

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
    
    // actual fetching of flight information happens here
    const proms: Promise<unknown>[] = []
    for (let i = 0; i < segment.routes.length; i += 1) {
      const routeInfo = segment.routes[i]
      if (!routeInfo) return undefined
      const gate = expandGate(routeInfo?.locations[segment.from.uniqueId])
      const flightNumber = routeInfo?.number
      const provider = getProvider(routeInfo)
      proms.push(provider)
      provider
        .then(providerName => {
          addToList(
            i === segment.routes.length - 1,
            providerName?.name ?? "",
            flightNumber ?? "",
            gate
          )
        })
        .catch(e => {
          console.error("Error getting provider", e)
        })
    }

    await Promise.allSettled(proms)
    return output
  }

  // if we get here, we don't know how to handle this segment, so give a generic instruction
  return `navigate from ${segment.from.shortName}, ${segment.from.name}, to 
  ${segment.to.shortName}, ${segment.to.name}`
}
