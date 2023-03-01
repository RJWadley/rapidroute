import { useEffect } from "react"

import { gsap } from "gsap"
import { Rectangle } from "pixi.js"
import { Text } from "react-pixi-fiber"

type ObjectType = Text

const objects: {
  item: ObjectType
  priority: number
}[] = []

const occupiedRectangles: Rectangle[] = []

export default function useHideOverlapping(
  item: React.RefObject<ObjectType>,
  priority = 0
) {
  useEffect(() => {
    const itemToTrack = item.current
    if (!itemToTrack) return
    // items with a higher priority should be first in the array
    const indexToInsert = objects.findIndex(
      object => object.priority < priority
    )
    const objectToInsert = { item: itemToTrack, priority }
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
  })
}

export const updateOverlappingVisibility = () => {
  occupiedRectangles.length = 0
  objects.forEach(object => {
    const { item } = object
    const rectangle = item.getBounds?.()
    const isOverlapping = occupiedRectangles.some(otherRect =>
      rectangle?.intersects(otherRect)
    )
    if (!isOverlapping && rectangle) {
      gsap.to(item, { alpha: 1, duration: 0.5 })
      occupiedRectangles.push(rectangle)
    } else {
      gsap.to(item, { alpha: 0, duration: 0.5 })
    }
  })
}
