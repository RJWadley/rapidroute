/* eslint-disable no-param-reassign */
import { Graphics, IRenderer, Sprite, Texture } from "pixi.js"
import { CustomPIXIComponent } from "react-pixi-fiber"

interface LineProps {
  /**
   * the color of the line as a hex code, eg #123456
   */
  colors: string[]
  point: { x: number; z: number }
  renderable?: boolean
  renderer: IRenderer
}

const textures: { [key: string]: Texture } = {}

const TYPE = "MulticolorDot"
export default CustomPIXIComponent(
  {
    customDisplayObject: () => new Sprite(),
    customApplyProps(
      instance: Sprite,
      previousProps,
      { point, colors, renderable, renderer }: LineProps
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
        // create a renderTexture, draw the graphics object to it, and then use that for the sprite texture
        const key = colors.join(",")
        if (!textures[key]) generateTexture(colors, renderer)
        instance.texture = textures[key]
        instance.x = point.x
        instance.y = point.z
        instance.anchor.set(0.5, 0.5)
        const width = 20 + (colors.length - 1) * 16
        instance.width = width
        instance.height = width
      }
    },
  },
  TYPE
)

function generateTexture(colors: string[], renderer: IRenderer) {
  const graphics = new Graphics()

  colors.forEach((color, index) => {
    const invertedIndex = colors.length - index - 1
    const colorAsNumber = parseInt(color.replace("#", ""), 16)
    graphics.beginFill(colorAsNumber)
    graphics.drawCircle(0, 0, 20 + invertedIndex * 16)
    graphics.endFill()
  })

  const texture = renderer.generateTexture(graphics)
  textures[colors.join(",")] = texture
}
