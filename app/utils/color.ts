import { hsla, parseToHsla, toHex } from "color2k"

/**
 *
 * given a light color, return a dark color of the same hue
 * or vice versa
 *
 * @param color the color to invert
 * @returns the inverted color
 */
export default function invertLightness(color: string) {
	if (color.startsWith("var")) {
		throw new Error("Cannot invert a color variable")
	}

	const [hue, saturation, lightness, alpha] = parseToHsla(color)
	const colorIsLight = lightness > 0.5
	const newLightness = colorIsLight ? 0.15 : 0.85

	return {
		inverted: toHex(hsla(hue, saturation, newLightness, alpha)),
		darkColor: toHex(hsla(hue, saturation, 0.15, alpha)),
		lightColor: toHex(hsla(hue, saturation, 0.85, alpha)),
	}
}
