import { DisplayObject, Rectangle } from "pixi.js"

export default function updateVisibilities(objectIn: DisplayObject): void {
  const item = objectIn
  const showThisObject = item.alpha > 0.01 && item.visible
  if (showThisObject) {
    item.renderable = true
    item.hitArea = null
  } else {
    item.renderable = false
    item.hitArea = new Rectangle(0, 0, 0, 0)
  }

  if (showThisObject)
    objectIn.children?.forEach(child => {
      if (child instanceof DisplayObject) updateVisibilities(child)
    })
}
