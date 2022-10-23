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
      /#([0-9a-f])([0-9a-f])([0-9a-f])/i,
      "#$1$1$2$2$3$3"
    )
  }

  const [h, s, l] = hexToHSL(colorToInvert)

  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
    console.error("INVALID COLOR", color, colorToInvert)
  }

  const newL = l > 0.5 ? 0.15 : 0.85
  return `hsl(${h * 360}, ${s * 100}%, ${newL * 100}%)`
}

const hexToHSL = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = (max + min) / 2
  let s = (max + min) / 2
  const l = (max + min) / 2

  if (max === min) {
    h = 0
    s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h, s, l]
}
