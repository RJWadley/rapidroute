import { SegmentType } from "components/createSegments"
import { getLineDirection } from "components/Segment/getLineDirections"
import getProvider from "components/Segment/getProvider"
import { expandGate } from "components/Segment/SingleRoute"

/**
 * given a route segment, return directions for the player to follow to complete the segment
 * @param segment the segment to get directions for
 * @returns a phrase with instructions for the player to follow
 */
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
    let output = `take any flight to ${segment.to.shortName}. You have ${segment.routes.length} options:`

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