import { SegmentType } from "components/createSegments"
import { SPEEDS } from "pathfinding/findPath/getRouteTime"
import { session } from "utils/localUtils"

import { stopToNumber } from "./getNavigationInstruction"

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
  const fromCoords = session.lastKnownLocation
  const toCoords = segment.to.location
  const distance = Math.sqrt(
    ((fromCoords?.x ?? Infinity) - (toCoords?.x ?? Infinity)) ** 2 +
      ((fromCoords?.z ?? Infinity) - (toCoords?.z ?? Infinity)) ** 2
  )

  if (inObject(mode, SPEEDS)) {
    return Math.max(distance / SPEEDS[mode]) + numberOfStops * 10
  }

  return 0
}
