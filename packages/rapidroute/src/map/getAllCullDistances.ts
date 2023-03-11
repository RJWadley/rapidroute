import { Rectangle } from "pixi.js"

interface CullInput {
  bounds: Rectangle
  priority: number
  minZoom?: number
  allowChange?: boolean
  itemIndex: number
}

export interface CullInfo {
  target: CullInput
  zoom: number
}

/**
 * get the zoom level at which two rectangles will intersect
 * @param objects
 */
const getAllCullDistances = (objectsToCheck: CullInput[]): CullInfo[] => {
  /**
   * get the amount of space between two rectangles
   * @param rect1
   * @param rect2
   */
  const getDistanceOnAxis = (
    rect1: Rectangle,
    rect2: Rectangle,
    axis: "x" | "y"
  ): number => {
    const pos1 = axis === "x" ? rect1.x : rect1.y
    const pos2 = axis === "x" ? rect2.x : rect2.y
    const size1 = axis === "x" ? rect1.width : rect1.height
    const size2 = axis === "x" ? rect2.width : rect2.height

    // empty rectangles should be treated as infinitely far apart
    if (size1 === 0 || size2 === 0) return Infinity

    if (pos1 < pos2) {
      return pos2 - (pos1 + size1)
    }
    return pos1 - (pos2 + size2)
  }

  /**
   * get the zoom level at which two rectangles will intersect
   */
  function getCullDistance(rect1: Rectangle, rect2: Rectangle): number {
    // first find the distance between the two rectangles
    const distanceX = getDistanceOnAxis(rect1, rect2, "x")
    const distanceY = getDistanceOnAxis(rect1, rect2, "y")

    // calculate both the x and y zoom levels and return the bigger one
    const averageSizeX = (rect1.width + rect2.width) / 2
    const totalSpaceTakenX = averageSizeX + distanceX
    const zoomLevelToCullX = totalSpaceTakenX / averageSizeX
    const averageSizeY = (rect1.height + rect2.height) / 2
    const totalSpaceTakenY = averageSizeY + distanceY
    const zoomLevelToCullY = totalSpaceTakenY / averageSizeY

    return 1 / Math.max(zoomLevelToCullX, zoomLevelToCullY)
  }

  // first, sort the objects by priority, highest priority first
  // then, sort the objects by zoom to cull at, where lower comes first (treat undefined as 0)
  const sortedObjects = objectsToCheck
    .sort((a, b) => b.priority - a.priority)
    .sort((a, b) => (a.minZoom ?? 0) - (b.minZoom ?? 0))

  const cullInfo: CullInfo[] = []

  // now iterate through the objects and add them to the cullInfo array with zoom levels

  sortedObjects.forEach(object => {
    let zoomToShowAt = object.minZoom ?? 0
    cullInfo.forEach(existingObject => {
      const zoom = getCullDistance(object.bounds, existingObject.target.bounds)
      zoomToShowAt = Math.max(zoomToShowAt, zoom)
    })
    cullInfo.push({
      zoom: zoomToShowAt,
      target: object,
    })
  })

  return cullInfo
}

export default getAllCullDistances
