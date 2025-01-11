export const SCALE_FACTOR = 0.7072

/**
 * rotate a point around a center point by a given angle
 */
const rotatePoints = (
	x: number,
	y: number,
	cx: number,
	cy: number,
	angleDegrees: number,
) => {
	const angleRadians = (angleDegrees * Math.PI) / 180
	const cos = Math.cos(angleRadians)
	const sin = Math.sin(angleRadians)
	const newX = (x - cx) * cos - (y - cy) * sin + cx
	const newY = (x - cx) * sin + (y - cy) * cos + cy

	return { x: Math.round(newX * 100) / 100, z: Math.round(newY * 100) / 100 }
}

/**
 * adjust the vertical position of a 3d point from flat -> isometric
 */
export const shiftWorldCoordinateToIsometric = ({
	x,
	y,
	z,
}: { x: number; y: number; z: number }) => {
	return { x: x + y * SCALE_FACTOR, z: z - y * SCALE_FACTOR }
}

/**
 * adjust the vertical position of a 3d point from isometric -> flat
 */
export const shiftWorldCoordinateFromIsometric = ({
	x,
	y,
	z,
}: { x: number; y: number; z: number }) => {
	return { x: x - y * SCALE_FACTOR, z: z + y * SCALE_FACTOR }
}

/**
 * convert a 3d world coordinate to an isometric 3d world coordinate
 */
export const convertPointToIsometric = ({ x, z }: { x: number; z: number }) => {
	const { x: newX, z: newZ } = rotatePoints(x, z, 0, 0, -45)

	return shiftWorldCoordinateToIsometric({
		x: newX,
		y: 60,
		z: newZ * SCALE_FACTOR - 32,
	})
}

/**
 * convert an isometric 3d world coordinate to a 3d world coordinate
 */
export const convertPointFromIsometric = ({
	x,
	z,
}: { x: number; z: number }) => {
	const unshifted = shiftWorldCoordinateFromIsometric({
		x,
		y: 60,
		z: (z + 32) / SCALE_FACTOR,
	})

	return rotatePoints(unshifted.x, unshifted.z, 0, 0, 45)
}

export const unskew = (isometric: boolean) => ({
	angle: isometric ? 45 : 0,
	scale: isometric ? { x: 1, y: 1 / SCALE_FACTOR } : { x: 1, y: 1 },
})
