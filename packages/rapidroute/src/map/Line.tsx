/* eslint-disable no-param-reassign */
import { PixiComponent } from "@pixi/react"
import { Graphics, LINE_CAP, LINE_JOIN } from "pixi.js"

interface LineProps {
  /**
   * the color of the line as a hex code, eg #123456
   */
  color: string
  points: {
    x: number
    z: number
  }[]
  background?: boolean
}

const renderPoints = ({
  instance,
  points,
  color,
  native,
  width = 10,
}: {
  instance: Graphics
  points: LineProps["points"]
  color: string
  native: boolean
  width?: number
}) => {
  const colorAsHex = parseInt(color.replace("#", ""), 16)

  instance.lineStyle({
    color: colorAsHex,
    cap: LINE_CAP.ROUND,
    join: LINE_JOIN.ROUND,
    width,
    native,
  })
  instance.moveTo(points[0].x, points[0].z)
  points.forEach(({ x, z }) => {
    instance.lineTo(x, z)
  })
}

const TYPE = "Line"
export default PixiComponent(TYPE, {
  create: () => new Graphics(),
  applyProps(
    instance: Graphics,
    _,
    { points, color, background = false }: LineProps
  ) {
    instance.cullable = true
    instance.clear()
    renderPoints({
      instance,
      points,
      color: background ? "#000000" : color,
      native: false,
      width: background ? 15 : 10,
    })
    if (!background) renderPoints({ instance, points, color, native: true })
  },
})
