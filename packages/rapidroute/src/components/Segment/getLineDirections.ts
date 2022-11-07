const westEastLines = ["X", "N", "S", "L"]
const northSouthLines = ["Z", "E", "J", "W"]
const inOutLines = ["A", "T", "I", "M", "D", "P", "V", "H", "F"]
const circleLines = ["C"]

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
  return parseInt(stop.replace(/\D/g, ""), 10)
}

/**
 * given two MRT stations, return the direction of travel between them (according to in-game signs)
 * @param fromStop the name of the station the player is currently at
 * @param toStop the name of the station the player is traveling to
 * @returns the direction of travel between the two stations
 */
export const getLineDirection = (fromStop: string, toStop: string) => {
  const lineCode = fromStop[0]
  const lineModifier = fromStop[1]
  const toLineModifier = toStop[1]

  const fromStopNumber = stopToNumber(fromStop)
  const toStopNumber = stopToNumber(toStop)
  const fromIsBigger = fromStopNumber > toStopNumber

  /**
   * handle east-west lines
   */
  if (westEastLines.includes(lineCode)) {
    if (lineModifier === "E") {
      return fromIsBigger ? "Eastbound" : "Westbound"
    }
    if (lineModifier === "W") {
      return fromIsBigger ? "Westbound" : "Eastbound"
    }
    return toLineModifier === "E" ? "Eastbound" : "Westbound"
  }

  /**
   * handle north-south lines
   */
  if (northSouthLines.includes(lineCode)) {
    if (lineModifier === "N") {
      return fromIsBigger ? "Southbound" : "Northbound"
    }
    if (lineModifier === "S") {
      return fromIsBigger ? "Northbound" : "Southbound"
    }
    return toLineModifier === "N" ? "Northbound" : "Southbound"
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
  if (circleLines.includes(lineCode)) {
    return fromIsBigger ? "Counter-Clockwise" : "Clockwise"
  }

  // if we get here, we don't know the direction
  return ""
}
