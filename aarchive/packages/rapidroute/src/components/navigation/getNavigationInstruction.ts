import { SegmentType } from "components/Segment/createSegments"
import { getLineDirection } from "components/Segment/getLineDirections"
import getProvider from "components/Segment/getProvider"
import { expandGate } from "components/Segment/SingleRoute"
import { getDistance } from "pathfinding/findPath/pathUtil"

/**
 * given a route segment, return directions for the player to follow to complete the segment
 * @param segment the segment to get directions for
 * @returns a phrase with instructions for the player to follow
 */
export default async function getNavigationInstruction(
  segment: SegmentType | undefined
) {
  if (!segment) return

  /**
   * If we're going to or from Spawn, say "Warp"
   */
  if (segment.from.uniqueId === "Spawn" || segment.to.uniqueId === "Spawn")
    return `Warp to ${segment.to.shortName}, ${segment.to.name}`

  /**
   * Instructions for walking to a location
   * If we're transferring, say "Transfer to <line> at <station>"
   * otherwise, say "Walk to <station>"
   */
  if (segment.routes.length === 0)
    return `${
      segment.from.type === "MRT Station" &&
      segment.to.type === "MRT Station" &&
      getDistance(
        segment.from.coords?.x ?? Infinity,
        segment.from.coords?.z ?? Infinity,
        segment.to.coords?.x ?? Infinity,
        segment.to.coords?.z ?? Infinity
      ) < 200
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
      if (!routeInfo) return
      const gate = expandGate(routeInfo.places[segment.from.uniqueId])
      const flightNumber = routeInfo.number
      const provider = await getProvider(routeInfo)
      const providerName = provider?.name
      const atGate = gate ? `at ${gate}` : ""
      return `take ${providerName ?? "a"} flight ${flightNumber ?? ""} to ${
        segment.to.shortName
      }, ${segment.to.name} ${atGate}`
    }

    /**
     * If there are multiple flights, first say the destination airport, then
     * list the number of flights and information about each flight
     */
    const output = `take any flight to ${segment.to.shortName}. You have ${segment.routes.length} options:`

    const getTextOfMultiFlight = (
      last: boolean,
      providerName: string,
      number: string | number,
      gate?: string | null
    ) => {
      return `${last ? "And," : ""} ${providerName} flight ${number} ${
        gate ? `at ${gate}` : ""
      }. `
    }

    const segments = segment.routes.map(async routeInfo => {
      if (!routeInfo) return
      const gate = expandGate(routeInfo.places[segment.from.uniqueId])
      const flightNumber = routeInfo.number
      const provider = await getProvider(routeInfo)
      const providerName = provider?.name

      return getTextOfMultiFlight(
        routeInfo === segment.routes[segment.routes.length - 1],
        providerName ?? "",
        flightNumber ?? "",
        gate
      )
    })

    await Promise.allSettled(segments)
    return output + segments.join("")
  }

  // if we get here, we don't know how to handle this segment, so give a generic instruction
  return `navigate from ${segment.from.shortName}, ${segment.from.name}, to 
  ${segment.to.shortName}, ${segment.to.name}`
}
