import { SegmentType } from "components/Segment/createSegments"
import { inObject, SPEEDS } from "pathfinding/findPath/getRouteTime"
import { getLocal } from "utils/localUtils"

/**
 * calculates the time it takes to travel from the player's current position to the next instruction
 * if the mode doesn't have a speed, it will return 0
 */
export default function getTimeToInstruction(
  segment: SegmentType,
  numberOfStopsIn: number
) {
  const numberOfStops = numberOfStopsIn === 1 ? 0 : numberOfStopsIn

  const mode = segment.routes[0]?.type ?? "walk"
  const fromCoords = getLocal("lastKnownLocation") ?? {
    x: Infinity,
    z: Infinity,
  }
  const toCoords = segment.to.location ?? { x: Infinity, z: Infinity }
  const diffX = Math.abs(fromCoords.x - toCoords.x)
  const diffZ = Math.abs(fromCoords.z - toCoords.z)

  // the distance is manhattan distance
  const distance = Math.max(0, Math.abs(diffX) + Math.abs(diffZ) - 10)

  if (inObject(mode, SPEEDS)) {
    return Math.max(distance / SPEEDS[mode]) + numberOfStops * 10
  }

  return 0
}
