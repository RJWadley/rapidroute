/* eslint-disable no-param-reassign */
import { PixiComponent } from "@pixi/react"
import { Graphics, IRenderer, Sprite, Texture } from "pixi.js"

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

const BASE_WIDTH = 20
const LAYER_WIDTH = 16

const TYPE = "MulticolorDot"
export default PixiComponent(TYPE, {
  create: () => new Sprite(),
  applyProps(
    instance: Sprite,
    previousProps: Partial<LineProps>,
    { point, colors, renderable, renderer }: LineProps
  ) {
    const pointChanged =
      previousProps.point?.x !== point.x || previousProps.point.z !== point.z
    const colorsChanged =
      previousProps.colors?.length !== colors.length ||
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
      const width = BASE_WIDTH + (colors.length - 1) * LAYER_WIDTH
      instance.width = width
      instance.height = width
    }
  },
})

function generateTexture(colors: string[], renderer: IRenderer) {
  const graphics = new Graphics()

  colors.forEach((color, index) => {
    const invertedIndex = colors.length - index - 1
    const colorAsNumber = parseInt(color.replace("#", ""), 16)
    graphics.beginFill(colorAsNumber)
    graphics.drawCircle(
      0,
      0,
      (BASE_WIDTH + invertedIndex * LAYER_WIDTH) * renderer.resolution
    )
    graphics.endFill()
  })

  const texture = renderer.generateTexture(graphics)
  textures[colors.join(",")] = texture
}
