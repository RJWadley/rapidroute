/* eslint-disable no-param-reassign */
import { Rectangle, IHitArea, EventMode } from "pixi.js"

const emptyRect = new Rectangle(0, 0, 0, 0)
export function hideItem(item: {
  renderable?: boolean
  hitArea?: IHitArea | null
  eventMode?: EventMode
}) {
  item.renderable = false
  item.hitArea = emptyRect
}

export function showItem(
  item: {
    renderable?: boolean
    hitArea?: IHitArea | null
    eventMode?: EventMode
  },
  eventMode: EventMode = "static"
) {
  item.renderable = true
  item.eventMode = eventMode
  item.hitArea = undefined
}
