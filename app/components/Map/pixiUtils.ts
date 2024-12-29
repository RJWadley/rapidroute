import type { EventMode, IHitArea } from "pixi.js"
import { Rectangle } from "pixi.js"

export const SCALE_FACTOR = 0.7072

/**
 * raise and lower the world coordinate by y blocks when in 3d view
 */
export const shiftWorldCoordinate = (x: number, y: number, z: number) => {
	return { x: x + y * SCALE_FACTOR, z: z - y * SCALE_FACTOR }
}

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

	return { x: Math.round(newX * 100) / 100, y: Math.round(newY * 100) / 100 }
}

/**
 * rotate around 0, 0 by -45 degrees, then scale y by SCALE_FACTOR
 */
export const skewWorldCoordinate = (x: number, y: number, z: number) => {
	const { x: newX, y: newY } = rotatePoints(x, z, 0, 0, -45)

	return { x: newX, z: newY * SCALE_FACTOR - 32 }
}

const emptyRect = new Rectangle(0, 0, 0, 0)
export function hideItem(item: {
	visible?: boolean
	hitArea?: IHitArea | null
	eventMode?: EventMode
}) {
	item.visible = false
	item.hitArea = emptyRect
}

export function showItem(
	item: {
		visible?: boolean
		renderable?: boolean
		hitArea?: IHitArea | null
		eventMode?: EventMode
	},
	eventMode: EventMode = "static",
) {
	item.visible = true
	item.renderable = true
	item.eventMode = eventMode
	item.hitArea = undefined
}
