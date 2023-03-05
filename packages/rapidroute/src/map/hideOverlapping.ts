import { useEffect, useState } from "react"

import { gsap } from "gsap"
import { Viewport } from "pixi-viewport"
import { Rectangle } from "pixi.js"
import { Container, Sprite, Text } from "react-pixi-fiber"

import { sleep } from "utils/functions"

type ObjectType = Text | Sprite | Container

type OverlappingProperties = {
  name: string
  item: ObjectType
  priority: number
  /**
   * should we be allowed to change the alpha of this item?
   */
  allowChange?: boolean
  /**
   * at what zoom level should we hide this item?
   */
  minZoom?: number
}

const objects: OverlappingProperties[] = []

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
  "hover",
] as const
export type PriorityType = (typeof priorities)[number]

export default function useHideOverlapping({
  item,
  name,
  priority,
  allowChange = true,
  minZoom,
  skipCheck = false,
}: {
  item: React.RefObject<ObjectType>
  name: string
  priority: PriorityType
  allowChange?: boolean
  minZoom?: number
  skipCheck?: boolean
}) {
  const [refreshSignal, setRefreshSignal] = useState(0)

  useEffect(() => {
    if (skipCheck) return
    const itemToTrack = item.current
    const priorityNumber = priorities.indexOf(priority)
    if (!itemToTrack) {
      // check again in 100ms
      if (refreshSignal > 10) {
        console.error("item not found:", name)
        return
      }
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
      allowChange,
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
  }, [allowChange, item, minZoom, name, priority, refreshSignal, skipCheck])

}

const updatesPerFrame = 100

export const updateOverlappingVisibility = (viewport: Viewport) => {
  occupiedRectangles.length = 0
  const promises = objects.map(async (object, index) => {
    const offset = Math.floor(index / updatesPerFrame)
    await sleep(offset * 16)
    const { item, allowChange, minZoom } = object
    const rectangle = item.getBounds?.()
    const isOverlapping = occupiedRectangles.some(otherRect =>
      rectangle?.intersects(otherRect)
    )
    if (allowChange) gsap.killTweensOf(item)

    const cullByZoom = () => minZoom && viewport.scale.x < minZoom
    const shouldShow =
      // either not overlapping or not allowed to hide
      (!isOverlapping || !allowChange) &&
      // and not culled by zoom level
      !cullByZoom() &&
      // and is visible on screen
      item.visible

    if (shouldShow && rectangle) {
      if (allowChange)
        gsap.to(item, {
          alpha: 1,
          duration: 0.5,
          onUpdate: () => {
            if (cullByZoom()) {
              gsap.to(item, {
                alpha: 0,
                duration: 0.5,
              })
            }
          },
        })
      if (item.renderable) occupiedRectangles.push(rectangle)
    } else if (allowChange) {
      gsap.to(item, {
        alpha: 0,
        duration: 0.5,
      })
    }
    // if not on screen. hide it immediately
    if (!item.visible && allowChange) {
      item.alpha = 0
    }
  })

  return Promise.all(promises)
}
