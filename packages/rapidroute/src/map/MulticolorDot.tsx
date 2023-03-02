/* eslint-disable no-param-reassign */
import { Graphics } from "pixi.js"
import { CustomPIXIComponent } from "react-pixi-fiber"

interface LineProps {
  /**
   * the color of the line as a hex code, eg #123456
   */
  colors: string[]
  point: { x: number; z: number }
  renderable?: boolean
}

const TYPE = "MulticolorDot"
export default CustomPIXIComponent(
  {
    customDisplayObject: () => new Graphics(),
    customApplyProps(
      instance: Graphics,
      previousProps,
      { point, colors, renderable }: LineProps
    ) {
      const pointChanged =
        previousProps?.point.x !== point.x || previousProps.point.z !== point.z
      const colorsChanged =
        previousProps?.colors.length !== colors.length ||
        previousProps.colors.some((color, index) => color !== colors[index])
      const renderableChanged = previousProps?.renderable !== renderable

      if (renderableChanged) {
        instance.renderable = renderable ?? true
      }
      if (pointChanged || colorsChanged) {
        instance.clear()
        colors.forEach((color, index) => {
          const invertedIndex = colors.length - index - 1
          const colorAsNumber = parseInt(color.replace("#", ""), 16)
          instance.beginFill(colorAsNumber)
          instance.drawCircle(point.x, point.z, 10 + invertedIndex * 8)
          instance.endFill()
        })
      }
    },
  },
  TYPE
)
