import type { EventMode, IHitArea } from "pixi.js"
import { Rectangle } from "pixi.js"

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
