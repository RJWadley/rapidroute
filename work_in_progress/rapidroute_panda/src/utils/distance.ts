/**
 * given two locations, return the manhattan distance between them
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
	return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}
