import { MarkerSet } from "types/dynmapMarkers"

import { Point, pointsMatch } from "./pointUtils"

export const getCombinedLine = (set: MarkerSet) => {
  // merge all the lines into one line. Do this by comparing the first
  // and last points of each line, and if they are closer than 50 blocks
  // concat the lines together
  const lines = Object.values(set.lines)
  const combinedLine: Point[] = []
  for (const _ of lines) {
    for (const __ of lines) {
      const nextLine = lines.shift()
      const linePoints = nextLine?.x.map((x, i) => ({
        x,
        z: nextLine.z[i] ?? Infinity,
      }))
      const firstLinePoint = linePoints?.[0]
      const lastLinePoint = linePoints?.[linePoints.length - 1]
      const firstCombinedPoint = combinedLine[0]
      const lastCombinedPoint = combinedLine.at(-1)

      if (linePoints) {
        if (pointsMatch(firstLinePoint, lastCombinedPoint)) {
          // if the first line point matches the last combined point, push to end
          combinedLine.push(...linePoints)
        }
        // if the last line point matches the first combined point, push to start
        else if (pointsMatch(lastLinePoint, firstCombinedPoint)) {
          combinedLine.unshift(...linePoints)
        }
        // if the first line point matches the first combined point, reverse and push to start
        else if (pointsMatch(firstLinePoint, firstCombinedPoint)) {
          combinedLine.unshift(...linePoints.reverse())
        }
        // if the last line point matches the last combined point, reverse and push to end
        else if (pointsMatch(lastLinePoint, lastCombinedPoint)) {
          combinedLine.push(...linePoints.reverse())
        } else if (combinedLine.length === 0) {
          combinedLine.push(...linePoints)
        }
      }
    }
  }

  const lineIsLoop = pointsMatch(combinedLine[0], combinedLine.at(-1))

  return {
    line: combinedLine,
    isLoop: lineIsLoop,
  }
}
