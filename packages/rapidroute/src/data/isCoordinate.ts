export default function isCoordinate(id: string):
  | {
      x: number
      z: number
    }
  | false {
  const xString = id.match(/-?\d+/g)?.[0]
  const zString = id.match(/-?\d+/g)?.[1]

  if (!xString || !zString) return false

  const x = parseInt(xString, 10)
  const z = parseInt(zString, 10)

  if (typeof x === "number" && typeof z === "number") {
    return { x, z }
  }
  return false
}
