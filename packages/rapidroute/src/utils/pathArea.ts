const polygonArea = (polygon: [number, number][]) => {
  let area = 0
  let j = polygon.length - 1
  for (let i = 0; i < polygon.length; i += 1) {
    area += (polygon[j][0] + polygon[i][0]) * (polygon[j][1] - polygon[i][1])
    j = i
  }
  return Math.abs(area / 2)
}

/**
 * given an SVG path, calculate the area
 */
export default function pathToArea(pathToConvert: string) {
  const points: [number, number][] = []

  const indexesOfLetters = pathToConvert
    .split("")
    .flatMap((letter, index) => (letter.match(/[A-Z]/) ? index : []))

  const pathSegments = indexesOfLetters.flatMap((index, i) => {
    const nextIndex = indexesOfLetters[i + 1]
    return nextIndex ? pathToConvert.slice(index + 1, nextIndex) : []
  })

  const letterCommands = indexesOfLetters.map(index =>
    pathToConvert.charAt(index)
  )

  letterCommands.forEach((letter, i) => {
    switch (letter) {
      case "M":
      case "L": {
        const [x, y] = pathSegments[i].split(" ").map(Number)
        points.push([x, y])
        break
      }
      case "V": {
        const previousX = points[points.length - 1][0]
        const [y2] = pathSegments[i].split(" ").map(Number)
        points.push([previousX, y2])
        break
      }
      case "H": {
        const previousY = points[points.length - 1][1]
        const [x2] = pathSegments[i].split(" ").map(Number)
        points.push([x2, previousY])
        break
      }
      case "Z": {
        const firstPoint = points[0]
        points.push(firstPoint)
        break
      }
      default:
        throw new Error(`Unknown letter command: ${letter}`)
    }
  })

  return polygonArea(points)
}
