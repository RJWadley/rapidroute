/* eslint-disable no-param-reassign */
import { Rectangle, IHitArea } from "pixi.js"

const emptyRect = new Rectangle(0, 0, 0, 0)
export function hideItem(item: {
  renderable?: boolean
  hitArea?: IHitArea | null
  interactive?: boolean
}) {
  item.renderable = false
  item.hitArea = emptyRect
}

export function showItem(
  item: {
    renderable?: boolean
    hitArea?: IHitArea | null
    interactive?: boolean
  },
  interactive = true
) {
  item.renderable = true
  item.interactive = interactive
  item.hitArea = undefined
}
