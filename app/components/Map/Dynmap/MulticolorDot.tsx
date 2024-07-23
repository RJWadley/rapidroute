import { extend } from "@pixi/react"
import type { Renderer, Texture } from "pixi.js"
import { Graphics, Sprite } from "pixi.js"

interface LineProps {
	/**
	 * the color of the line as a hex code, eg #123456
	 */
	colors: string[]
	point: { x: number; z: number }
	visible?: boolean
	renderer: Renderer
}

const textures: Record<string, Texture> = {}

const BASE_WIDTH = 20
const LAYER_WIDTH = 16

extend({ Sprite })

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
		<sprite
			texture={texture}
			x={point.x}
			y={point.z}
			width={width}
			height={width}
			visible={visible}
			anchor={{ x: 0.5, y: 0.5 }}
		/>
	)
}

function generateTexture(colors: string[], renderer: Renderer) {
	const graphics = new Graphics()

	colors.forEach((color, index) => {
		const invertedIndex = colors.length - index - 1
		const colorAsNumber = Number.parseInt(color.replace("#", ""), 16)
		graphics.circle(
			0,
			0,
			(BASE_WIDTH + invertedIndex * LAYER_WIDTH) * renderer.resolution,
		)
		graphics.fill(colorAsNumber)
	})

	const texture = renderer.generateTexture(graphics)
	textures[colors.join(",")] = texture

	return texture
}
