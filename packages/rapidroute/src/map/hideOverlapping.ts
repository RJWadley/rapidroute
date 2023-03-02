import { useEffect, useState } from "react"

import { gsap } from "gsap"
import { Viewport } from "pixi-viewport"
import { Rectangle } from "pixi.js"
import { Sprite, Text } from "react-pixi-fiber"

type ObjectType = Text | Sprite

const objects: {
  name: string
  item: ObjectType
  priority: number
  allowHide: boolean
  minZoom?: number
}[] = []

const occupiedRectangles: Rectangle[] = []

/**
 * Items with a higher priority (index) will be preferred.
 */
const priorities = [
  "Unranked",
  "Community",
  "Councillor",
  "Mayor",
  "Senator",
  "Governor",
  "Premier",
  "spawn",
  "players",
] as const
export type PriorityType = (typeof priorities)[number]

export default function useHideOverlapping({
  item,
  name,
  priority,
  allowHide = true,
  minZoom,
}: {
  item: React.RefObject<ObjectType>
  name: string
  priority: PriorityType
  /**
   * if false, the item will be tracked but never hidden
   */
  allowHide?: boolean
  minZoom?: number
}) {
  const [refreshSignal, setRefreshSignal] = useState(0)

  useEffect(() => {
    const itemToTrack = item.current
    const priorityNumber = priorities.indexOf(priority)
    if (!itemToTrack) {
      // check again in 100ms
      const timeout = setTimeout(() => setRefreshSignal(refreshSignal + 1), 100)
      return () => clearTimeout(timeout)
    }

    // items with a higher priority should be first in the array
    const indexToInsert = objects.findIndex(
      object => object.priority < priorityNumber
    )
    const objectToInsert = {
      item: itemToTrack,
      priority: priorityNumber,
      name,
      allowHide,
      minZoom,
    }
    if (indexToInsert === -1) {
      objects.push(objectToInsert)
    } else {
      objects.splice(indexToInsert, 0, objectToInsert)
    }

    return () => {
      const indexToRemove = objects.indexOf(objectToInsert)
      objects.splice(indexToRemove, 1)
    }
  }, [allowHide, item, minZoom, name, priority, refreshSignal])
}

export const updateOverlappingVisibility = (viewport: Viewport) => {
  occupiedRectangles.length = 0
  const currentZoom = viewport.scale.x
  objects.forEach(object => {
    const { item } = object
    const rectangle = item.getBounds?.()
    const isOverlapping = occupiedRectangles.some(otherRect =>
      rectangle?.intersects(otherRect)
    )
    gsap.killTweensOf(item)

    const cullByZoom = object.minZoom && currentZoom < object.minZoom
    const shouldShow =
      // either not overlapping or not allowed to hide
      (!isOverlapping || !object.allowHide) &&
      // and not culled by zoom level
      !cullByZoom &&
      // and is on screen
      item.visible

    if (shouldShow && rectangle) {
      item.hitArea = undefined // enables pointer events
      item.renderable = true
      gsap.to(item, {
        alpha: 1,
        duration: 0.5,
      })
      occupiedRectangles.push(rectangle)
    } else if (item.renderable) {
      gsap.to(item, {
        alpha: 0,
        duration: 0.5,
        onComplete: () => {
          item.renderable = false
          // disable pointer events so we can click through invisible items
          item.hitArea = new Rectangle(0, 0, 0, 0)
        },
      })
    }
  })
}
