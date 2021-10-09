const DATA_SHEET_ID = "1qVtW6cSIH-gjJZWrvqJXvQG17ZgRQ7sxXfUjZJcR2lE" // 3 calls
const AIRPORT_GATE_SHEET = "null" //1 call
const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps" //1 call
const TOWN_SHEET_ID = "null"
const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8"

const VERSION = 0

//globals
let logos: {
  [key: string]: string
} = {}
let colors: {
  [key: string]: string
} = {}

let routes: Array<Route> = getItem("routes") || []
let places: Array<Place> = getItem("places") || []
let providers: Array<Provider> = getItem("providers") || []
let codeshares: {
  [key: string]: string
} = getItem("codeshares") || {}

type Mode = "flight" | "seaplane" | "heli" | "MRT" | "walk"
type World = "New" | "Old"
type Source = "data" | "transit" | "both" | "dynmap"

interface Route {
  from: string
  to: string
  mode: Mode
  provider?: string
  number?: string
  displayBy?: string
  hasFromGateData?: boolean
  hasToGateData?: boolean
}

interface Place {
  id: string
  world: World
  shortName?: string
  longName?: string
  displayName?: string
  x?: number
  z?: number
  keywords?: string
}

interface Provider {
  name: string
  displayName?: string
  prefix?: string
  logo?: string
  color?: string
}

async function getTransitSheet() {
  return new Promise(resolve => {
    $.ajax({
      url: "https://sheets.googleapis.com/v4/spreadsheets/" + DATA_SHEET_ID + "/values:batchGet?" +
        "ranges='MRT Transit'!B3:B5" + //row info
        "&ranges='MRT Transit'!F3:F5" + //column info
        "&key=" + API_KEY,
      success: function(result) {
        let rows = result.valueRanges[0].values
        let cols = result.valueRanges[1].values

        //now get transit sheet
        $.ajax({
          url: "https://sheets.googleapis.com/v4/spreadsheets/" + TRANSIT_SHEET_ID + "/values:batchGet?" +
            //rows[0] is the last row and cols[0] is last column
            `ranges='Airline Class Distribution'!A3:C${rows[0][0]}` + //airports
            `&ranges='Airline Class Distribution'!E2:${cols[0][0]}2` + //company names
            `&ranges='Airline Class Distribution'!E3:${cols[0][0]}${rows[0][0]}` + //actual flight numbers
            //same scheme here
            `&ranges='Helicopters'!A2:C${rows[2][0]}` + //heliports
            `&ranges='Helicopters'!E1:${cols[2][0]}1` + //companynames
            `&ranges='Helicopters'!E2:${cols[2][0]}${rows[2][0]}` + //actual flight numbers
            //and seaplanes
            `&ranges='Seaplane Class Distribution'!A3:C${rows[1][0]}` + //heliports
            `&ranges='Seaplane Class Distribution'!D2:${cols[1][0]}2` + //companynames
            `&ranges='Seaplane Class Distribution'!D3:${cols[1][0]}${rows[1][0]}` + //actual flight numbers
            "&key=" + API_KEY,
          success: function(result) {
            resolve(result)
          }
        })
      }
    })
  })
}

async function getDataSheet() {
  return new Promise(resolve => {
    $.ajax({
      url: "https://sheets.googleapis.com/v4/spreadsheets/" + DATA_SHEET_ID + "/values:batchGet?" +
        "ranges='MRT'!B2:G19" + //mrt info
        "&ranges='Airports'!A3:F500" +
        "&ranges='Companies'!A2:E200" +
        "&ranges='CodeSharing'!A3:E200" +
        "&key=" + API_KEY,
      success: function(result) {
        resolve(result)
      }
    })
  })
}

function parseRawFlightData(
  mode: Mode,
  placesRaw: Array<Array<string>>,
  providersRaw: Array<string>,
  routesRaw: Array<Array<string>>
) {

  //first parse the places
  let placeList: Array<Place> = []
  placesRaw.forEach(place => {

    let world = <World>place[2] //default to new
    if (world != "Old" && world != "New") {
      world = "New"
    }

    placeList.push({
      id: place[1] || place[0],
      world: world,
      shortName: place[1],
      longName: place[0]
    })
  })

  places.push(...placeList) //add to global

  routesRaw = transpose(routesRaw) //routeData needs to be transposed

  let airlines: Array<Provider> = []
  let flights: Array<Route> = []

  //for each airline
  providersRaw.forEach((airline, i) => {


    airlines.push({ name: airline })
    let flightsByNumber: {
      [key: string]: Array<Place>,
    } = {}

    routesRaw[i] ?.forEach((cell, j) => { //for each cell
      if (cell == "" || cell == undefined) return //skip if empty
      cell.split(",").forEach((flight) => { //for each flight number in cell

        // add to flightsByNumber
        flight = flight.trim()
        if (flightsByNumber[flight] == undefined) {
          flightsByNumber[flight] = []
        }
        flightsByNumber[flight].push(placeList[j])

      })
    });



    Object.keys(flightsByNumber).forEach(flightNumber => {
      flightsByNumber[flightNumber].forEach(destinationA => {
        flightsByNumber[flightNumber].forEach(destinationB => {
          if (destinationA == destinationB) return
          flights.push({
            from: destinationA.id,
            to: destinationB.id,
            mode: mode,
            provider: airline,
            number: flightNumber
          })
        })
      })
    })
  })

  routes.push(...flights)
  providers.push(...airlines)
}

function parseCodeshares(codesharesRaw: Array<Array<string>>) {
  codesharesRaw.forEach((company, i) => {

    let range = company[1] ?.split("-") || [] //range.split
    if (range.length < 2) return

    colors[company[2]] = company[4] //colors[displayName] = color
    logos[company[2]] = company[3] //logos[displayName] = logo

    for (var i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
      //name + number = displayname
      codeshares[company[0] + i] = company[2] //
    }
  });
}

function processAirportMetadata(rawAirportData: Array<Array<string>>) {

  rawAirportData.forEach(rawAirport => {
    let coords = rawAirport[5] ? parseCoordinates(rawAirport[5]) : undefined

    let id = rawAirport[1] ?? rawAirport[0]
    if (id == "") id = rawAirport[0]

    let world = rawAirport[2] as World
    if (world != "New" && world != "Old") world = "New"

    let newPlace: Place = {
      id,
      world
    }

    let shortName = rawAirport[1]
    if (shortName != "" && shortName != undefined) newPlace.shortName = shortName

    let longName = rawAirport[0]
    if (longName != "" && longName != undefined) newPlace.longName = longName

    let displayName = rawAirport[3]
    if (displayName != "" && displayName != undefined) newPlace.displayName = displayName

    let keywords = rawAirport[4]
    if (keywords != "" && keywords != undefined) newPlace.keywords = keywords

    if (coords != undefined) {
      newPlace.x = coords[0]
      newPlace.z = coords[1]
    }

    places.push(newPlace)

  })

}

function parseCoordinates(coords: string) {
  let split = coords.split(" ")
  let out: Array<number> = []
  split.forEach((item, i) => {
    out[i] = parseInt(item.replace(/,/g, ''));
  })

  if (out.length == 3) {
    out[2] = out[3]
    out.pop()
  }

  return out
}

function processAirlineMetadata(rawAirlineData: Array<Array<string>>) {
  return new Promise(resolve => {
    //set legacy gate numbers and
    //request new gate numbers
    let requestURL = "https://sheets.googleapis.com/v4/spreadsheets/" + DATA_SHEET_ID +
      "/values:batchGet?ranges='Legacy Gate Data'!A:D"

    rawAirlineData.forEach((company) => {

      if (company[3])
        logos[company[0]] = company[3]
      if (company[4])
        colors[company[0]] = company[4]

      if (company.length > 1) {
        if (company[1] == "Yes") {
          requestURL += "&ranges='" + company[0] + "'!A:D"
        }
      }
    });

    $.ajax({
      url: requestURL + "&key=" + API_KEY,
      success: function(result) {
        parseAirlineGateData(result, rawAirlineData, resolve)
      }
    });
  })
}

function parseAirlineGateData(result: any, companies: Array<Array<string>>, resolve: Function) {

  let gateData: Array<Array<string>> = []

  let sheets = result.valueRanges

  let legacySheet = sheets.shift().values as Array<Array<string>>
  legacySheet.shift()

  //process legacy gates
  companies.forEach((company) => {
    if (company.length > 1) {
      if (company[1] == "Legacy") {
        let flights = legacySheet.filter(x => x[0] == company[2])
        flights.forEach((item) => {
          item[0] = company[0]
        });
        gateData = [...gateData, ...flights]
      }
    }
  });

  //process other gates

  sheets.forEach((sheet: any) => {

    let companyName: string = ""
    if (sheet.range.indexOf("'") == -1) {
      companyName = sheet.range.split("!")[0]
    } else {
      companyName = sheet.range.split("'")[1]
    }

    let flights = sheet.values as Array<Array<string>>
    flights.forEach((flight) => {
      flight[0] = companyName
    });

    gateData = [...gateData, ...flights]
  });

  //now add gate info to routes
  routes.forEach((route, i) => {
    if (gateData.filter(x => (x[0] == route.provider && x[1] == route.number && x[2] == route.from)).length > 0) {
      routes[i]["hasFromGateData"] = true
    }
    if (gateData.filter(x => (x[0] == route.provider && x[1] == route.number && x[2] == route.to)).length > 0) {
      routes[i]["hasToGateData"] = true
    }
  });

  resolve(true)

}

function generateMrt(rawMRTInfo: Array<Array<string>>, rawStopInfo: Array<Array<string>>) {

  let routeList: Array<Route> = []
  let placeList: Array<Place> = []

  //generate list of MRT stop routes
  rawMRTInfo.forEach((item, i) => {
    let minSE = 2
    let maxNW = 3
    let nsew = 4
    let lineCode = item[1]
    let lineName = item[0]
    let lineColor = item[5]

    colors[lineName] = lineColor

    let line = []
    //0: {Name: "Artic Line", Code: "A", Min-SE: "X", Max-NW: "53"}
    if (item[minSE] == "X") {
      line = [lineCode + "X"]
      let max = item[maxNW] as unknown as number
      for (var i = 0; i <= max; i++) {
        line.push(lineCode + i)
      }
    } else if (item[minSE] == "XHW") {
      line = [lineCode + "X", lineCode + "H", lineCode + "W"]
      let max = item[maxNW] as unknown as number
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + i)
      }
    } else if (item[nsew] == "NS") {
      let min = item[minSE] as unknown as number
      for (var i = min; i > 0; i--) {
        line.push(lineCode + "S" + i)
      }
      line.push(lineCode + "0")
      let max = item[maxNW] as unknown as number
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + "N" + i)
      }
    } else if (item[nsew] == "EW") {
      let min = item[minSE] as unknown as number
      for (var i = min; i > 0; i--) {
        line.push(lineCode + "E" + i)
      }
      line.push(lineCode + "0")
      let max = item[maxNW] as unknown as number
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + "W" + i)
      }
    } else {
      let max = item[maxNW] as unknown as number
      for (var i = 1; i <= max; i++) {
        line.push(lineCode + i)
      }
    }

    //create routes
    for (var i = 0; i < line.length; i++) {
      if (i != 0) {
        routeList.push({
          from: line[i],
          to: line[i - 1],
          mode: "MRT",
          provider: lineName,
        })
      }
      if (i != line.length - 1) {
        routeList.push({
          from: line[i],
          to: line[i + 1],
          mode: "MRT",
          provider: lineName,
        })
      }
    }
  });

  //and generate stop names for place list
  rawStopInfo.forEach((item) => {

    //add place
    if (item[0] == undefined) return
    placeList.push({
      id: item[0],
      world: "New"
    })
  })

  //and C is a ring line, so add those
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

  routes.push(...routeList)
}

function generateMrtFromMarkers() {
  return new Promise(resolve => {
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json')}`)
      .then(response => {
        return response.json();
      }).then(data => {

        data = JSON.parse(data.contents)

        resolve(true)

        let sets = data.sets

        Object.keys(sets).forEach(lineName => {
          if (lineName == "roads.a" || lineName == "roads.b" ||
            lineName == "worldborder.markerset" || lineName == "cities"
            || lineName == "markers" || lineName == "old")
            return
          let currentLine = sets[lineName].markers

          let displayName = sets[lineName].label

          providers.push({
            name: lineName,
            displayName
          })

          Object.keys(currentLine).forEach(stopCode => {

            let currentId = stopCode.toUpperCase()

            //fix id mistakes
            if (currentId == "WN34 STATION") currentId = "WN34"
            if (currentId == "MS") currentId = "MH"
            if (currentId == "M0") currentId = "MW"
            if (currentId == "WH24") currentId = "WN24"

            let name = currentLine[stopCode].label
            if (name.substr(name.length - 1, name.length) == ")")
              name = name.substr(0, name.length - 3 - currentId.length)

            places.push({
              id: currentId,
              world: "New",
              shortName: currentId,
              longName: name,
              x: currentLine[stopCode].x,
              z: currentLine[stopCode].z
            })

          })
        })
      });
  })
}

function combineData() {
  let newProviders: Array<Provider> = []

  while (providers.length > 0) {

    let current = providers[0].name;
    let find = providers.filter(x => x.name == current)
    providers = providers.filter(x => x.name != current)

    let newObject = find[0]

    Object.assign(newObject, ...find)
    newProviders.push(newObject)
  }

  providers = newProviders

  let newPlaces: Array<Place> = []

  while (places.length > 0) {

    let current = places[0].id;
    let find = places.filter(x => x.id == current)
    places = places.filter(x => x.id != current)

    let newObject = find[0]

    Object.assign(newObject, ...find)

    newPlaces.unshift(newObject)
  }

  places = newPlaces
}

async function loadData() {
  let transitSheet: any = getTransitSheet()
  let dataSheet: any = getDataSheet()
  let markers: any = generateMrtFromMarkers()

  transitSheet = await transitSheet;
  dataSheet = await dataSheet;
  markers = await markers

  dataSheet = dataSheet.valueRanges

  generateMrt(dataSheet[0].values, dataSheet[0].values)

  transitSheet = transitSheet.valueRanges

  parseRawFlightData("flight",
    transitSheet[0].values, transitSheet[1].values[0], transitSheet[2].values)
  parseRawFlightData("heli",
    transitSheet[3].values, transitSheet[4].values[0], transitSheet[5].values)
  parseRawFlightData("seaplane",
    transitSheet[6].values, transitSheet[7].values[0], transitSheet[8].values)

  await processAirlineMetadata(dataSheet[2].values)

  processAirportMetadata(dataSheet[1].values)
  parseCodeshares(dataSheet[3].values)

  combineData()
  generateTimeMaps(routes, places)

}

loadData()
