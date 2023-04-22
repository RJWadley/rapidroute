const westEastLines = ["X", "N", "S", "L"]
const northSouthLines = ["Z", "E", "J", "W"]
const inOutLines = ["A", "T", "I", "M", "D", "P", "V", "H", "F"]
/**
 * Record of id to number of stops so that we can determine which direction around the circle is the shortest
 */
const circleLines = {
  C: 119, // 119 stations
  U: 99999, // unfinished line, so we'll just assume it's a big circle
}

const isCircleLineKey = (key: string): key is keyof typeof circleLines => {
  return key in circleLines
}

/**
 * takes a the name of an MRT station and returns the number of the
 * station or its numerical position, for determining travel direction
 * @param stop the name of the station
 * @returns the number of the station or its numerical position (relative to the other stations on the same line)
 */
export const stopToNumber = (stop: string | undefined) => {
  if (!stop) return 0

  if (stop[1] === "X") return -1
  if (stop === "MH") return -0.3
  if (stop === "MW") return -0.2

  // remove all non-numeric characters, then parse the number
  const rawNumber = parseInt(stop.replace(/\D/g, ""), 10)

  // if S or W, then the number is negative
  if (stop[1] === "S" || stop[1] === "W") return -rawNumber
  return rawNumber
}

/**
 * given two MRT stations, return the direction of travel between them (according to in-game signs)
 * @param fromStop the name of the station the player is currently at
 * @param toStop the name of the station the player is traveling to
 * @returns the direction of travel between the two stations
 */
export const getLineDirection = (fromStop: string, toStop: string) => {
  const lineCode = fromStop[0]
  if (!lineCode) return ""

  const fromStopNumber = stopToNumber(fromStop)
  const toStopNumber = stopToNumber(toStop)
  const fromIsBigger = fromStopNumber > toStopNumber

  /**
   * handle east-west lines
   */
  if (westEastLines.includes(lineCode)) {
    return fromIsBigger ? "Westbound" : "Eastbound"
  }

  /**
   * handle north-south lines
   */
  if (northSouthLines.includes(lineCode)) {
    return fromIsBigger ? "Southbound" : "Northbound"
  }

  /**
   * handle inbound/outbound lines
   */
  if (inOutLines.includes(lineCode)) {
    return fromIsBigger ? "Inbound" : "Outbound"
  }

  /**
   * handle circle lines
   */
  if (isCircleLineKey(lineCode)) {
    // if the line is a circle line, we need to determine which direction around the circle is the shortest
    const numberOfSegments = circleLines[lineCode] + 1 // add one because the line is circular
    const distanceBetweenStops = Math.abs(fromStopNumber - toStopNumber)
    const distanceAroundCircle = numberOfSegments - distanceBetweenStops
    const isShortestDistanceAroundCircle =
      distanceBetweenStops > distanceAroundCircle

    const aroundCircleDirection = fromIsBigger
      ? "Clockwise"
      : "Counter-Clockwise"
    const betweenStopsDirection = fromIsBigger
      ? "Counter-Clockwise"
      : "Clockwise"

    return isShortestDistanceAroundCircle
      ? aroundCircleDirection
      : betweenStopsDirection
  }

  // if we don't know the line, we can't determine the direction
  return ""
}
