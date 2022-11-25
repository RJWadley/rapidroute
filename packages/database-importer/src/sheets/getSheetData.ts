/* eslint-disable prefer-destructuring */
/* eslint-disable max-lines */
// 1 call

// fetch for node.js
import fetch from "node-fetch"

import { Markers, isMRTLine } from "../types/dynmapTypes"
import { SheetResponse } from "../types/googleSheetsTypes"
import {
  Aliases,
  LegacyPlace,
  LegacyProvider,
  LegacyRoute,
  Mode,
  World,
} from "../types/legacyTypes"

const DATA_SHEET_ID = "13t7mHiW9HZjbx9eFP2uTAO5tLyAelt5_iITqym2Ejn8" // 3 calls
const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps" // 1 call
const TOWN_SHEET_ID = "1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI" // 1 call
const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8"

function transpose<T>(a: T[][]): T[][] {
  // Calculate the width and height of the Array
  const w = a.length || 0

  // calculate the max height of array
  let maxHeight = 0
  a.forEach(item => {
    if (item.length > maxHeight) {
      maxHeight = item.length
    }
  })

  const h = maxHeight

  // In case it is a zero matrix, no transpose routine needed.
  if (h === 0 || w === 0) {
    return []
  }

  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
  let i: number
  let j: number
  const t: T[][] = []

  // Loop through every item in the outer array (height)
  for (i = 0; i < h; i += 1) {
    // Insert a new row (array)
    t[i] = []

    // Loop through every item per item in outer array (width)
    for (j = 0; j < w; j += 1) {
      // Save transposed data.
      t[i][j] = a[j][i]
    }
  }

  return t
}

// globals
const logos: {
  [key: string]: string
} = {}
let lightColors: {
  [key: string]: string
} = {}
let darkColors: {
  [key: string]: string
} = {}

let ignoredPlaces: string[] = []

let routes: LegacyRoute[] = []
let places: LegacyPlace[] = []
let providers: LegacyProvider[] = []
let codeshares: {
  [key: string]: {
    [key: string]: string
  }
} = {}
let spawnWarps: string[] = ["C1", "C33", "C61", "C89"]

const aliases: Aliases[] = []

async function getTransitSheet(): Promise<SheetResponse> {
  return new Promise(resolve => {
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${DATA_SHEET_ID}/values:batchGet?` +
        `ranges='MRT Transit'!B3:B5` + // row info
        `&ranges='MRT Transit'!F3:F5` + // column info
        `&ranges='MRT Transit'!A13:A100` + // airports to ignore
        `&key=${API_KEY}`
    )
      .then(res => {
        return res.json()
      })
      .then((result: SheetResponse) => {
        const rows = result.valueRanges[0].values
        const cols = result.valueRanges[1].values
        ignoredPlaces = result.valueRanges[2].values.flat()
        // now get transit sheet
        fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${TRANSIT_SHEET_ID}/values:batchGet?` +
            // rows[0] is the last row and cols[0] is last column
            `ranges='Airline Class Distribution'!A3:C${rows[0][0]}` + // airports
            `&ranges='Airline Class Distribution'!E2:${cols[0][0]}2` + // company names
            `&ranges='Airline Class Distribution'!E3:${cols[0][0]}${rows[0][0]}` + // actual flight numbers
            // same scheme here
            `&ranges='Helicopters'!A2:C${rows[2][0]}` + // heliports
            `&ranges='Helicopters'!E1:${cols[2][0]}1` + // companynames
            `&ranges='Helicopters'!E2:${cols[2][0]}${rows[2][0]}` + // actual flight numbers
            // and seaplanes
            `&ranges='Seaplane Class Distribution'!A3:C${rows[1][0]}` + // heliports
            `&ranges='Seaplane Class Distribution'!D2:${cols[1][0]}2` + // companynames
            `&ranges='Seaplane Class Distribution'!D3:${cols[1][0]}${rows[1][0]}` + // actual flight numbers
            `&key=${API_KEY}`
        )
          .then(res => {
            return res.json()
          })
          .then((finalResult: SheetResponse) => {
            resolve(finalResult)
          })
          .catch(err => {
            console.error(err)
            process.exit(1)
          })
      })
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  })
}

async function getDataSheet(): Promise<SheetResponse> {
  return new Promise(resolve => {
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${DATA_SHEET_ID}/values:batchGet?` +
        `ranges='MRT'!B2:H25` + // mrt info
        `&ranges='Airports'!A3:F500` +
        `&ranges='Companies'!A2:F200` +
        `&ranges='CodeSharing'!A3:F200` +
        `&key=${API_KEY}`
    )
      .then(res => {
        return res.json()
      })
      .then((result: SheetResponse) => {
        resolve(result)
      })
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  })
}

function getTowns() {
  return new Promise(resolve => {
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${TOWN_SHEET_ID}/values:batchGet?` +
        `ranges='New World'!A2:G1000` +
        `&key=${API_KEY}`
    )
      .then(res => {
        return res.json()
      })
      .then((result: SheetResponse) => {
        const towns = result.valueRanges[0].values
        towns.forEach(town => {
          const placeObject: LegacyPlace = {
            id: town[0],
            world: "New",
            type: "town",
            shortName: `${town[1]} City`,
            longName: town[0],
            x: parseInt(town[4], 10),
            z: parseInt(town[6], 10),
            keywords: `${town[1]} ${town[2]} ${town[3]}`,
          }
          places.push(placeObject)
          if (town[1] === "Premier") {
            spawnWarps.push(town[0])
          }
        })
        places.push({
          id: "Spawn",
          world: "New",
          type: "town",
          shortName: "Spawn",
          longName: "Central City",
          x: 1,
          z: 1,
        })
        spawnWarps.push("Spawn")
        resolve(result)
      })
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  })
}

function parseRawFlightData(
  mode: Mode,
  placesRaw: string[][],
  providersRaw: string[],
  routesRawer: string[][]
) {
  // first parse the places
  const placeList: LegacyPlace[] = []
  placesRaw.forEach(place => {
    const worldRaw = place[2]
    const world = worldRaw === "New" ? "New" : "Old"

    placeList.push({
      id: place[1] || place[0],
      world,
      shortName: place[1],
      longName: place[0],
      type: "airport",
      MRT_TRANSIT_NAME: place[1],
    })
  })

  places.push(...placeList) // add to global

  const routesRaw = transpose(routesRawer) // routeData needs to be transposed

  const airlines: LegacyProvider[] = []
  const flights: LegacyRoute[] = []

  // for each airline
  providersRaw.forEach((airline, i) => {
    airlines.push({ name: airline })
    const flightsByNumber: {
      [key: string]: LegacyPlace[]
    } = {}

    routesRaw[i]?.forEach((cell, j) => {
      // for each cell
      if (!cell) return // skip if empty
      cell.split(",").forEach(rawNum => {
        // for each flight number in cell

        // add to flightsByNumber
        const flight = rawNum.trim()
        if (flightsByNumber[flight] === undefined) {
          flightsByNumber[flight] = []
        }
        flightsByNumber[flight].push(placeList[j])
      })
    })

    Object.keys(flightsByNumber).forEach(flightNumber => {
      flightsByNumber[flightNumber].forEach(destinationA => {
        flightsByNumber[flightNumber].forEach(destinationB => {
          if (destinationA === destinationB) return
          flights.push({
            from: destinationA.id,
            to: destinationB.id,
            mode,
            provider: airline,
            number: flightNumber,
          })
        })
      })
    })
  })

  routes.push(...flights)
  providers.push(...airlines)
}

function parseCodeshares(codesharesRaw: string[][]) {
  codesharesRaw.forEach(company => {
    const range = company[1]?.split("-") || [] // range.split

    if (range.length < 2) return

    lightColors[company[2]] = company[4] // colors[displayName] = color
    darkColors[company[2]] = company[5] // colors[displayName] = color
    logos[company[2]] = company[3] // logos[displayName] = logo

    if (codeshares[company[0]] === undefined) codeshares[company[0]] = {}

    for (let i = parseInt(range[0], 10); i <= parseInt(range[1], 10); i += 1) {
      // name + number = displayname
      codeshares[company[0]][i] = company[2] //
    }

    aliases.push({
      actualProvider: company[0],
      displayProvider: company[2],
      start: range[0],
      end: range[1],
    })

    providers.push({
      name: company[2],
    })
  })
}

function parseCoordinates(coords: string) {
  let split = coords.split(" ")
  let out: number[] = []
  split.forEach((item, i) => {
    out[i] = parseInt(item.replace(/,/g, ""), 10)
  })

  if (out.length === 3) {
    out[1] = out[2]
    out.pop()
  }

  if (out.length !== 2) {
    split = coords.split(",")
    out = []
    split.forEach((item, i) => {
      out[i] = parseInt(item.trim(), 10)
    })
  }

  if (out.length === 3) {
    out[1] = out[2]
    out.pop()
  }

  return out
}

function processAirportMetadata(rawAirportData: string[][]) {
  rawAirportData.forEach(rawAirport => {
    const coords = rawAirport[5] ? parseCoordinates(rawAirport[5]) : undefined

    let id = rawAirport[1] ?? rawAirport[0]
    if (id === "") id = rawAirport[0]

    const rawWorld = rawAirport[2]
    const world: World =
      rawWorld !== "New" && rawWorld !== "Old" ? "New" : rawWorld

    const newPlace: LegacyPlace = {
      id,
      world,
      type: "airport",
    }

    const shortName = rawAirport[1]
    if (shortName) newPlace.shortName = shortName

    const longName = rawAirport[0]
    if (longName) newPlace.longName = longName

    const displayName = rawAirport[3]
    if (displayName) newPlace.displayName = displayName

    const keywords = rawAirport[4]
    if (keywords) newPlace.keywords = keywords

    if (coords) {
      newPlace.x = coords[0]
      newPlace.z = coords[1]
    }

    places.push(newPlace)
  })
}

function parseAirlineGateData(
  result: SheetResponse,
  companies: string[][],
  resolve: (...args: unknown[]) => void
) {
  let gateData: string[][] = []

  const sheets = result.valueRanges

  const legacySheet = sheets.shift()?.values
  legacySheet?.shift()

  // process legacy gates
  companies.forEach(company => {
    if (company.length > 1) {
      if (company[1] === "Legacy") {
        const flights = legacySheet?.filter(x => x[0] === company[2])
        const mappedFlights = flights?.map(item => {
          const newItem = [...item]
          newItem[0] = company[0]
          return newItem
        })
        gateData = [...gateData, ...(mappedFlights ?? [])]
      }
    }
  })

  // process other gates
  sheets.forEach(sheet => {
    let companyName: string = ""
    if (sheet.range.indexOf("'") === -1) {
      companyName = sheet.range.split("!")[0]
    } else {
      companyName = sheet.range.split("'")[1]
    }

    const flights = sheet.values.map(item => {
      const newItem = [...item]
      newItem[0] = companyName
      return newItem
    })

    gateData = [...gateData, ...flights]
  })

  // now add gate info to routes
  routes.forEach((route, i) => {
    if (route.mode === "MRT") return

    const fromGate = gateData.filter(
      x =>
        x[0] === route.provider && x[1] === route.number && x[2] === route.from
    )[0]?.[3]
    const toGate = gateData.filter(
      x => x[0] === route.provider && x[1] === route.number && x[2] === route.to
    )[0]?.[3]

    if (fromGate) {
      routes[i].fromGate = fromGate
    }
    if (toGate) {
      routes[i].toGate = toGate
    }
  })

  resolve(true)
}

function processAirlineMetadata(rawAirlineData: string[][]) {
  return new Promise(resolve => {
    // set legacy gate numbers and
    // request new gate numbers
    let requestURL = `https://sheets.googleapis.com/v4/spreadsheets/${DATA_SHEET_ID}/values:batchGet?ranges='Legacy Gate Data'!A:D`

    rawAirlineData.forEach(company => {
      if (company[3]) logos[company[0]] = company[3]
      if (company[4]) lightColors[company[0]] = company[4]
      if (company[5]) darkColors[company[0]] = company[5]

      if (company.length > 1) {
        if (company[1] === "Yes") {
          requestURL += `&ranges='${company[0]}'!A:D`
        }
      }
    })

    fetch(`${requestURL}&key=${API_KEY}`)
      .then(response => response.json())
      .then((result: SheetResponse) => {
        parseAirlineGateData(result, rawAirlineData, resolve)
      })
      .catch(e => {
        console.error(e)
        resolve(true)
      })
  })
}

function generateMrt(rawMRTInfo: string[][], rawStopInfo: string[][]) {
  const routeList: LegacyRoute[] = []
  const placeList: LegacyPlace[] = []

  // generate list of MRT stop routes
  rawMRTInfo.forEach(item => {
    const minSE = 2
    const maxNW = 3
    const nsew = 4
    const lineCode = item[1]
    const lineName = item[0]
    const lightLineColor = item[5]
    const darkLineColor = item[6]

    lightColors[lineName] = lightLineColor
    darkColors[lineName] = darkLineColor

    let line = []
    // 0: {Name: "Artic Line", Code: "A", Min-SE: "X", Max-NW: "53"}
    if (item[minSE] === "X") {
      line = [`${lineCode}X`]
      const max = parseInt(item[maxNW], 10)
      for (let i = 0; i <= max; i += 1) {
        line.push(`${lineCode}${i}`)
      }
    } else if (item[minSE] === "XHW") {
      line = [`${lineCode}X`, `${lineCode}H`, `${lineCode}W`]
      const max = parseInt(item[maxNW], 10)
      for (let i = 1; i <= max; i += 1) {
        line.push(`${lineCode}${i}`)
      }
    } else if (item[nsew] === "NS") {
      const min = parseInt(item[minSE], 10)
      for (let i = min; i > 0; i -= 1) {
        line.push(`${lineCode}S${i}`)
      }
      line.push(`${lineCode}0`)
      const max = parseInt(item[maxNW], 10)
      for (let i = 1; i <= max; i += 1) {
        line.push(`${lineCode}N${i}`)
      }
    } else if (item[nsew] === "EW") {
      const min = parseInt(item[minSE], 10)
      for (let i = min; i > 0; i -= 1) {
        line.push(`${lineCode}E${i}`)
      }
      line.push(`${lineCode}0`)
      const max = parseInt(item[maxNW], 10)
      for (let i = 1; i <= max; i += 1) {
        line.push(`${lineCode}W${i}`)
      }
    } else {
      const max = parseInt(item[maxNW], 10)
      for (let i = 1; i <= max; i += 1) {
        line.push(`${lineCode}${i}`)
      }
    }

    // create routes
    for (let i = 0; i < line.length; i += 1) {
      if (i !== 0) {
        routeList.push({
          from: line[i],
          to: line[i - 1],
          mode: "MRT",
          provider: lineName,
        })
      }
      if (i !== line.length - 1) {
        routeList.push({
          from: line[i],
          to: line[i + 1],
          mode: "MRT",
          provider: lineName,
        })
      }

      // spawn warps
      if ((i === 0 || i === line.length - 1) && lineName !== "circle") {
        spawnWarps.push(line[i])
      }
    }
  })

  // and generate stop names for place list
  rawStopInfo.forEach(item => {
    // add place
    if (item[0] === undefined) return
    placeList.push({
      id: item[0],
      world: "New",
      type: "MRT",
    })
  })

  // and C is a ring line, so add those
  routeList.push({
    from: "C1",
    to: "C119",
    mode: "MRT",
    provider: "circle",
  })
  routeList.push({
    from: "C119",
    to: "C1",
    mode: "MRT",
    provider: "circle",
  })

  // mrt marina shuttle
  routeList.push({
    from: "XE8",
    to: "XEM",
    mode: "MRT",
    provider: "expo",
  })

  routeList.push({
    from: "XEM",
    to: "XE8",
    mode: "MRT",
    provider: "expo",
  })

  routes.push(...routeList)
}

const placeLocations: Record<
  string,
  {
    x: number
    y: number
    z: number
  }
> = {}

function generateMrtFromMarkers(): Promise<boolean> {
  return new Promise(resolve => {
    fetch(
      "https://cors.mrtrapidroute.com/?https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
    )
      .then(response => {
        return response.json()
      })
      .then((data: Markers) => {
        resolve(true)

        const { sets } = data

        Object.keys(sets).forEach(lineName => {
          if (lineName === "airports") {
            const airports = sets.airports.markers

            Object.keys(airports).forEach(airportId => {
              const airport = airports[airportId]

              placeLocations[airportId] = {
                x: airport.x,
                y: airport.y,
                z: airport.z,
              }
            })
          }

          if (!isMRTLine(lineName)) return

          const currentLine = sets[lineName].markers

          const displayName = sets[lineName].label

          providers.push({
            name: lineName,
            displayName,
          })

          Object.keys(currentLine).forEach(stopCode => {
            let currentId = stopCode.toUpperCase()

            // fix id mistakes
            if (currentId === "WN34 STATION") currentId = "WN34"
            if (currentId === "MS") currentId = "MH"
            if (currentId === "M0") currentId = "MW"
            if (currentId === "WH24") currentId = "WN24"

            let name = currentLine[stopCode].label
            if (name.substr(name.length - 1, name.length) === ")")
              name = name.substr(0, name.length - 3 - currentId.length)

            places.push({
              id: currentId,
              world: "New",
              shortName: currentId,
              longName: name,
              x: currentLine[stopCode].x,
              z: currentLine[stopCode].z,
              type: "MRT",
            })
          })
        })
      })
      .catch(err => {
        console.error(err)
        resolve(false)
      })
  })
}

function combineData() {
  const newProviders: LegacyProvider[] = []

  while (providers.length > 0) {
    const current = providers[0].name
    const find = providers.filter(x => x.name === current)
    providers = providers.filter(x => x.name !== current)

    const newObject = find[0]

    Object.assign(newObject, ...find)
    newProviders.push(newObject)
  }

  providers = newProviders

  let newPlaces: LegacyPlace[] = []

  while (places.length > 0) {
    const current = places[0].id

    const find = places.filter(x => x.id === current)
    places = places.filter(x => x.id !== current)

    const newObject = find[0]

    Object.assign(newObject, ...find)

    newPlaces.unshift(newObject)
  }

  newPlaces = newPlaces.filter(x => !ignoredPlaces.includes(x.id))

  places = newPlaces
}

export default async function getLegacyData() {
  routes = []
  places = []
  providers = []
  codeshares = {}
  spawnWarps = ["C1", "C33", "C61", "C89"]
  lightColors = {}
  darkColors = {}

  const transitSheetProm = getTransitSheet()
  const dataSheetProm = getDataSheet()
  const markers = generateMrtFromMarkers()
  const townsheet = getTowns()

  const transitSheetRaw = await transitSheetProm
  const dataSheetRaw = await dataSheetProm
  await markers
  await townsheet

  const dataSheet = dataSheetRaw.valueRanges

  generateMrt(dataSheet[0].values, dataSheet[0].values)

  const transitSheet = transitSheetRaw.valueRanges

  parseRawFlightData(
    "flight",
    transitSheet[0].values,
    transitSheet[1].values[0],
    transitSheet[2].values
  )
  parseRawFlightData(
    "heli",
    transitSheet[3].values,
    transitSheet[4].values[0],
    transitSheet[5].values
  )
  parseRawFlightData(
    "seaplane",
    transitSheet[6].values,
    transitSheet[7].values[0],
    transitSheet[8].values
  )

  await processAirlineMetadata(dataSheet[2].values)

  processAirportMetadata(dataSheet[1].values)
  parseCodeshares(dataSheet[3].values)
  combineData()

  return {
    routes,
    places,
    providers,
    aliases,
    spawnWarps,
    lightColors,
    darkColors,
    logos,
    placeLocations,
  }
}
