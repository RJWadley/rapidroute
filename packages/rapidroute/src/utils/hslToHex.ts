export default function hslToHex(colorIn: string) {
  const color = colorIn.replace(/hsl\(|\)/g, "").split(",")
  const h = parseInt(color[0], 10) / 360
  const s = parseInt(color[1], 10) / 100
  const l = parseInt(color[2], 10) / 100
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

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
