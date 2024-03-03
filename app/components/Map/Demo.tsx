import { Graphics } from "@pixi/react"
import { useMemo } from "react"

export default function Demo() {
  const rectangles = useMemo(
    () =>
      Array.from({ length: 100 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        color: Math.random() * 0xff_ff_ff,
      })),
    [],
  )

  return rectangles.map((rectangle, index) => (
    <Graphics
      key={index}
      draw={(g) => {
        g.beginFill(rectangle.color)
        g.drawRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
        g.endFill()
      }}
    />
  ))
}
