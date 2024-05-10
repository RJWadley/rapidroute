import { Sprite } from "@pixi/react"
import type { IRenderer, Texture } from "pixi.js"
import { Graphics } from "pixi.js"

interface LineProps {
  /**
   * the color of the line as a hex code, eg #123456
   */
  colors: string[]
  point: { x: number; z: number }
  visible?: boolean
  renderer: IRenderer
}

const textures: Record<string, Texture> = {}

const BASE_WIDTH = 20
const LAYER_WIDTH = 16

export default function MulticolorDot({
  point,
  colors,
  visible = true,
  renderer,
}: LineProps) {
  const key = colors.join(",")
  const texture = textures[key] ?? generateTexture(colors, renderer)
  const width = BASE_WIDTH + (colors.length - 1) * LAYER_WIDTH
  return (
    <Sprite
      texture={texture}
      x={point.x}
      y={point.z}
      width={width}
      height={width}
      visible={visible}
      anchor={[0.5, 0.5]}
    />
  )
}

function generateTexture(colors: string[], renderer: IRenderer) {
  const graphics = new Graphics()

  colors.forEach((color, index) => {
    const invertedIndex = colors.length - index - 1
    const colorAsNumber = parseInt(color.replace("#", ""), 16)
    graphics.beginFill(colorAsNumber)
    graphics.drawCircle(
      0,
      0,
      (BASE_WIDTH + invertedIndex * LAYER_WIDTH) * renderer.resolution,
    )
    graphics.endFill()
  })

  const texture = renderer.generateTexture(graphics)
  textures[colors.join(",")] = texture

  return texture
}
