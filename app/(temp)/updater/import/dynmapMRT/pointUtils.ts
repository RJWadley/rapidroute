export interface Point {
	x: number
	z: number
}

export type LineSegment = [Point, Point]

export const distance = (p1?: Point, p2?: Point) => {
	if (!p1 || !p2) return Number.POSITIVE_INFINITY
	return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2))
}

export const pointsMatch = (first?: Point, second?: Point) => {
	if (!first || !second) return false
	return distance(first, second) < 50
}

const linesIntersect = ([p1, p2]: LineSegment, [p3, p4]: LineSegment) => {
	const s1_x = p2.x - p1.x
	const s1_y = p2.z - p1.z
	const s2_x = p4.x - p3.x
	const s2_y = p4.z - p3.z

	const s =
		(-s1_y * (p1.x - p3.x) + s1_x * (p1.z - p3.z)) /
		(-s2_x * s1_y + s1_x * s2_y)
	const t =
		(s2_x * (p1.z - p3.z) - s2_y * (p1.x - p3.x)) / (-s2_x * s1_y + s1_x * s2_y)

	return s >= 0 && s <= 1 && t >= 0 && t <= 1
}

export const pointMatchesLine = (point: Point, [l1, l2]: LineSegment) => {
	const pointLine1: LineSegment = [
		{
			x: point.x + 50,
			z: point.z + 50,
		},
		{
			x: point.x - 50,
			z: point.z - 50,
		},
	]
	const pointLine2: LineSegment = [
		{
			x: point.x + 50,
			z: point.z - 50,
		},
		{
			x: point.x - 50,
			z: point.z + 50,
		},
	]

	return (
		linesIntersect(pointLine1, [l1, l2]) || linesIntersect(pointLine2, [l1, l2])
	)
}
