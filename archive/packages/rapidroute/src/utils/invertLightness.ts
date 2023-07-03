import { hexToHSL } from "./colorUtils"

/**
 *
 * given a light color, return a dark color of the same hue
 * or vice versa
 *
 * @param color hex color
 * @returns inverted hex color
 */
export default function invertLightness(color: string) {
  let colorToInvert = color

  if (colorToInvert.includes("var")) {
    return colorToInvert.replace("var(--", "var(--invert-")
  }

  if (colorToInvert.length === 4) {
    colorToInvert = colorToInvert.replace(
      /#([\da-f])([\da-f])([\da-f])/i,
      "#$1$1$2$2$3$3"
    )
  }

  const [h, s, l] = hexToHSL(colorToInvert)

  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
    console.error("INVALID COLOR", color, colorToInvert)
  }

  if (h === undefined || s === undefined || l === undefined) {
    console.error("INVALID COLOR", color, colorToInvert)
    return colorToInvert
  }

  const newL = l > 0.5 ? 0.15 : 0.85
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${newL * 100}%)`
}
