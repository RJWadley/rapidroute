import { SegmentType } from "components/createSegments"
import { stopToNumber } from "components/Segment/getLineDirections"
import { SPEEDS } from "pathfinding/findPath/getRouteTime"
import { session } from "utils/localUtils"

const inObject = <K extends string, O>(key: K, object: O): key is K & keyof O =>
  key in object

/**
 * calculates the time it takes to travel from the player's current position to the next instruction
 * if the mode doesn't have a speed, it will return 0
 */
export default function getTimeToInstruction(segment: SegmentType) {
  const fromNumber = stopToNumber(segment.from.shortName)
  const toNumber = stopToNumber(segment.to.shortName)
  const numberOfStops = Math.abs(fromNumber - toNumber) - 1

  const mode = segment.routes[0]?.type ?? "walk"
  const fromCoords = session.lastKnownLocation ?? { x: Infinity, z: Infinity }
  const toCoords = segment.to.location ?? { x: Infinity, z: Infinity }
  const diffX = Math.abs(fromCoords.x - toCoords.x)
  const diffZ = Math.abs(fromCoords.z - toCoords.z)

  // the distance is manhattan distance
  const distance = Math.abs(diffX) + Math.abs(diffZ)

  if (inObject(mode, SPEEDS)) {
    return Math.max(distance / SPEEDS[mode]) + numberOfStops * 10
  }

  return 0
}
