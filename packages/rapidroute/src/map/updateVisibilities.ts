/* eslint-disable no-param-reassign */
import { Viewport } from "pixi-viewport"
import { DisplayObject, Rectangle } from "pixi.js"

export default function updateVisibilities(
  item: DisplayObject,
  viewport: Viewport
): void {
  if (!item.visible) return

  const showThisObject = item.alpha > 0.01
  const needsToggling = item.renderable !== showThisObject
  if (needsToggling) {
    viewport.dirty = true
    if (showThisObject) {
      item.renderable = true
      item.hitArea = null
    } else {
      item.renderable = false
      item.hitArea = new Rectangle(0, 0, 0, 0)
    }
  }

  if (showThisObject)
    item.children?.forEach(child => {
      if (child instanceof DisplayObject) updateVisibilities(child, viewport)
    })
}
