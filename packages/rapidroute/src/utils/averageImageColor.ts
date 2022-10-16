/**
 * return the average hue of an image
 */
export default function averageImageHue(imageURL: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.src = imageURL
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const context = canvas.getContext("2d")
      if (!context) return reject(new Error("Could not get context"))
      context.drawImage(img, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = imageData
      let r = 0
      let g = 0
      let b = 0
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }
      const avg = [r / data.length, g / data.length, b / data.length]
      const hue = rgbToHsl(avg[0], avg[1], avg[2])[0]
      return resolve(hue)
    }
    img.onerror = err => {
      reject(err)
    }
  })
}

const rgbToHsl = (rIn: number, gIn: number, bIn: number) => {
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
      case b:
      default:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h, s, l]
}
