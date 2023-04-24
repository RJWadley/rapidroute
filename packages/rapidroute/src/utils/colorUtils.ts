const toHex = (x: number) => {
  const hex = Math.round(x * 255).toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}

export default function hslToHex(colorIn: string) {
  const color = colorIn.replace(/hsl\(|\)/g, "").split(",")
  const h = parseInt(color[0] ?? "0", 10) / 360
  const s = parseInt(color[1] ?? "0", 10) / 100
  const l = parseInt(color[2] ?? "0", 10) / 100
  let r
  let g
  let b

  if (s === 0) {
    r = l
    g = l
    b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let t2 = t
      if (t2 < 0) t2 += 1
      if (t2 > 1) t2 -= 1
      if (t2 < 1 / 6) return p + (q - p) * 6 * t2
      if (t2 < 1 / 2) return q
      if (t2 < 2 / 3) return p + (q - p) * (2 / 3 - t2) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const rgb2hex = (rgb: string) =>
  `#${
    rgb
      .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
      ?.slice(1)
      .map(n => parseInt(n, 10).toString(16).padStart(2, "0"))
      .join("") ?? "ff0000"
  }`

export const rgbToHsl = (
  rIn: number,
  gIn: number,
  bIn: number
): [number, number, number] => {
  const r = rIn / 255
  const g = gIn / 255
  const b = bIn / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h
  let s
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
