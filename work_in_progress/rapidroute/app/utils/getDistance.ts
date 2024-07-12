/**
 * returns distance between two points, manhattan distance
 */
export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
	return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}
