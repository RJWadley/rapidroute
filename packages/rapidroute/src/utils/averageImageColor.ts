/**
 * return the average hue of an image
 */
const averageImageHSL = (
  imageURL: string
): Promise<[number, number, number]> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.src = imageURL

    const onLoad = () => {
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
        r += data[i] ?? 0
        g += data[i + 1] ?? 0
        b += data[i + 2] ?? 0
      }
      const avg = [r / data.length, g / data.length, b / data.length]
      const hue = rgbToHsl(avg[0] ?? 0, avg[1] ?? 0, avg[2] ?? 0)

      img.removeEventListener("load", onLoad)
      img.removeEventListener("error", reject)
      return resolve(hue)
    }

    const onError = () => {
      img.removeEventListener("load", onLoad)
      img.removeEventListener("error", onError)
      return reject(new Error("Could not load image"))
    }

    img.addEventListener("load", onLoad)
    img.addEventListener("error", onError)
  })
}

import { useEffect, useState } from "react"

import { rgbToHsl } from "./colorUtils"

export const useImageHSL = (imageURL: string | null | undefined) => {
  const [hue, setHue] = useState<number>()
  const [saturation, setSaturation] = useState<number>()
  const [lightness, setLightness] = useState<number>()

  useEffect(() => {
    setHue(undefined)
    if (imageURL)
      averageImageHSL(imageURL)
        .then(newHSL => {
          setHue(newHSL[0] * 360)
          setSaturation(newHSL[1] * 300)
          return setLightness(newHSL[2] * 300)
        })
        .catch(() => {
          setHue(0)
          setSaturation(0)
          setLightness(0)
        })
  }, [imageURL])
  return [hue, saturation, lightness]
}
