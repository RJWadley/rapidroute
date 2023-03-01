import { Graphics } from "pixi.js"
import { CustomPIXIComponent } from "react-pixi-fiber"

interface LineProps {
  /**
   * the color of the line as a hex code, eg #123456
   */
  colors: string[]
  point: { x: number; z: number }
  background?: boolean
}

const TYPE = "Point"
export default CustomPIXIComponent(
  {
    customDisplayObject: () => new Graphics(),
    customApplyProps(instance: Graphics, _, { point, colors }: LineProps) {
      instance.clear()
      colors.forEach((color, index) => {
        const invertedIndex = colors.length - index - 1
        const colorAsNumber = parseInt(color.replace("#", ""), 16)
        instance.beginFill(colorAsNumber)
        instance.drawCircle(point.x, point.z, 10 + invertedIndex * 8)
        instance.endFill()
      })
    },
  },
  TYPE
)
