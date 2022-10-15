export default function isCoordinate(id: string) {
  return id.match(/^Coordinate: \d+, \d+$/g) !== null
}
