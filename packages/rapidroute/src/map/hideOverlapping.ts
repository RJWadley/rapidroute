import { useEffect, useState } from "react"

import { gsap } from "gsap"
import { Rectangle } from "pixi.js"
import { Sprite, Text } from "react-pixi-fiber"

type ObjectType = Text | Sprite

const objects: {
  item: ObjectType
  priority: number
  name: string
  allowHide: boolean
}[] = []

const occupiedRectangles: Rectangle[] = []

/**
 * Items with a higher priority (index) will be preferred.
 */
const priorities = ["premier", "spawn", "players"] as const
export type PriorityType = (typeof priorities)[number]

export default function useHideOverlapping({
  item,
  name,
  priority,
  allowHide = true,
}: {
  item: React.RefObject<ObjectType>
  name: string
  priority: PriorityType
  /**
   * if false, the item will be tracked but never hidden
   */
  allowHide?: boolean
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
    }
    if (indexToInsert === -1) {
      objects.push(objectToInsert)
    } else {
      objects.splice(indexToInsert, 0, objectToInsert)
    }

    updateOverlappingVisibility()

    return () => {
      const indexToRemove = objects.indexOf(objectToInsert)
      objects.splice(indexToRemove, 1)
    }
  }, [allowHide, item, name, priority, refreshSignal])
}

export const updateOverlappingVisibility = () => {
  occupiedRectangles.length = 0
  objects.forEach(object => {
    const { item } = object
    const rectangle = item.getBounds?.()
    const isOverlapping = occupiedRectangles.some(otherRect =>
      rectangle?.intersects(otherRect)
    )
    if ((!isOverlapping || !object.allowHide) && rectangle) {
      gsap.to(item, { alpha: 1, duration: 0.5, visible: true })
      occupiedRectangles.push(rectangle)
    } else {
      gsap.to(item, { alpha: 0, duration: 0.5, visible: false })
    }
  })
}
