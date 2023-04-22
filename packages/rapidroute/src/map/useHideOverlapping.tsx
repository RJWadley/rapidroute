import {
  Container as PixiContainer,
  Rectangle,
  Sprite as PixiSprite,
  Text as PixiText,
  Ticker,
} from "pixi.js"
import { useEffect, useRef, useState } from "react"
import { isBrowser } from "utils/functions"
import { wrap } from "utils/promise-worker"
import useInterval from "utils/useInterval"

import { CullInfo, CullInput, CullWorkerFunctions } from "./getAllCullDistances"
import { hideItem, showItem } from "./PixiUtils"
import { useViewport } from "./PixiViewport"

type ObjectType = PixiText | PixiSprite | PixiContainer
let updateNeeded = false

interface OverlappingProperties {
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
  const viewport = useViewport()

  useEffect(() => {
    if (skipCheck) {
      return
    }
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

    updateNeeded = true

    return () => {
      const indexToRemove = objects.indexOf(objectToInsert)
      objects.splice(indexToRemove, 1)
    }
  }, [
    allowChange,
    item,
    minZoom,
    name,
    priority,
    refreshSignal,
    skipCheck,
    viewport,
  ])
}

/**
 * get the bounding rectangle of the text at zoom level 1
 * @param item the item to get the bounds of
 * @returns rectangle of the bounds
 */
const getWorldBounds = (item: ObjectType): Rectangle => {
  const x = item.localTransform.tx ?? 0
  const y = item.localTransform.ty ?? 0
  const localBounds = item.getLocalBounds() ?? new Rectangle(0, 0, 0, 0)
  return new Rectangle(
    x + localBounds.x,
    y + localBounds.y,
    localBounds.width,
    localBounds.height
  )
}

export function useUpdateOverlapping() {
  const viewport = useViewport()
  const [distances, setDistances] = useState<CullInfo[]>([])
  const [localObjects, setLocalObjects] = useState<ObjectType[]>([])
  const isUpdating = useRef(false)
  const inFirstTenSeconds = useRef(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      inFirstTenSeconds.current = false
    }, 10_000)
    return () => clearTimeout(timeout)
  }, [])

  const updateObjects = () => {
    if (isUpdating.current) return
    if (!updateNeeded) return
    updateNeeded = false
    isUpdating.current = true
    const result = runCull(
      objects.map((object, i) => ({
        bounds: getWorldBounds(object.item),
        ...object,
        item: undefined,
        itemIndex: i,
      }))
    )
    result
      .then(newResult => {
        if (viewport) viewport.dirty = true
        isUpdating.current = false
        setDistances(newResult)
        setLocalObjects(objects.map(obj => obj.item))
      })
      .catch(console.error)
  }

  useInterval(updateObjects, 100)

  /**
   * apply the calculated culling
   */
  useEffect(() => {
    const update = () => {
      if (!viewport?.dirty) return
      if (viewport.destroyed) return
      const zoom = viewport.scale.x
      viewport.dirty = false
      distances.forEach(distance => {
        const {
          zoom: zoomLevelToCull,
          target: { itemIndex, allowChange },
        } = distance
        const item = localObjects[itemIndex]
        if (!allowChange || !item) return
        if (zoom < zoomLevelToCull) {
          hideItem(item)
        } else {
          showItem(item)
        }
      })
    }
    Ticker.shared.add(update)
    return () => {
      Ticker.shared.remove(update)
    }
  }, [distances, localObjects, viewport])
}

const overlappingWorkerRaw = (async () => {
  if (!isBrowser()) return
  const worker = new Worker(new URL("getAllCullDistances.ts", import.meta.url))
  return wrap<CullWorkerFunctions>(worker)
})()

const runCull = async (input: CullInput[]): Promise<CullInfo[]> => {
  const worker = await overlappingWorkerRaw
  if (!worker) return []
  return worker.getAllCullDistances(input)
}
