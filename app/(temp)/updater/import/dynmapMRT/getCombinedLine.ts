import { getDistance } from "(temp)/pathfinding/distance"

import type { MarkerSet } from "../../../types/dynmapMarkers"
import type { Point } from "./pointUtils"
import { pointsMatch } from "./pointUtils"

const pointsDistance = (a: Point | undefined, b: Point | undefined) => {
	if (!a || !b) return Number.POSITIVE_INFINITY
	return getDistance(a.x, a.z, b.x, b.z)
}

export const getCombinedLine = (set: MarkerSet) => {
	// merge all the lines into one line. Do this by comparing the first
	// and last points of each line, and if they are closer than 50 blocks
	// concat the lines together
	const numberOfLinks = Object.keys(set.lines).length
	let remainingLines = Object.values(set.lines)
	const combinedLine: Point[] = []
	for (let i = 0; i < numberOfLinks; i++) {
		let closestDistance = Number.POSITIVE_INFINITY

		// find the closest line
		for (const line of remainingLines) {
			const linePoints = line.x.map((x, i) => ({
				x,
				z: line.z[i] ?? Number.POSITIVE_INFINITY,
			}))

			closestDistance = Math.min(
				closestDistance,
				pointsDistance(combinedLine.at(0), linePoints.at(0)),
				pointsDistance(combinedLine.at(0), linePoints.at(-1)),
				pointsDistance(combinedLine.at(-1), linePoints.at(0)),
				pointsDistance(combinedLine.at(-1), linePoints.at(-1)),
			)
		}

		// append the line in the appropriate direction
		for (const line of remainingLines) {
			const linePoints = line.x.map((x, i) => ({
				x,
				z: line.z[i] ?? Number.POSITIVE_INFINITY,
			}))

			switch (closestDistance) {
				// append to the end, as is
				case pointsDistance(combinedLine.at(-1), linePoints.at(0)):
					combinedLine.push(...linePoints)
					remainingLines = remainingLines.filter((l) => l !== line)

					break

				// append to the end, reversed
				case pointsDistance(combinedLine.at(-1), linePoints.at(-1)):
					combinedLine.push(...[...linePoints].reverse())
					remainingLines = remainingLines.filter((l) => l !== line)

					break

				// prepend to the beginning, as is
				case pointsDistance(combinedLine.at(0), linePoints.at(-1)):
					combinedLine.unshift(...linePoints)
					remainingLines = remainingLines.filter((l) => l !== line)

					break

				// prepend to the beginning, reversed
				case pointsDistance(combinedLine.at(0), linePoints.at(0)):
					combinedLine.unshift(...[...linePoints].reverse())
					remainingLines = remainingLines.filter((l) => l !== line)
					break
			}
		}
	}

	const lineIsLoop = pointsMatch(combinedLine.at(0), combinedLine.at(-1))

	return {
		line: combinedLine,
		isLoop: lineIsLoop,
	}
}
