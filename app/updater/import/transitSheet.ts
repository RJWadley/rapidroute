// import type { PlaceType, RouteType } from "@prisma/client"

// import type {
//   PropertiesResponse,
//   SheetResponse,
// } from "../../types/googleSheets"
// import type {
//   BareCompany,
//   BarePlace,
//   BareRoute,
//   BareRouteLeg,
// } from "./temporaryDatabase"

// const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps"
// const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8"

// export async function importTransitSheet() {
//   // get the grid properties of the "Airline Class Distribution", "Seaplane Class Distribution", and "Helicopters" sheets
//   const response = (await fetch(
//     `https://sheets.googleapis.com/v4/spreadsheets/${TRANSIT_SHEET_ID}?key=${API_KEY}&fields=sheets.properties(title,gridProperties)`,
//   ).then((r) => r.json())) as PropertiesResponse

//   const airlineSheet = response.sheets.find(
//     (sheet) => sheet.properties.title === "Airline Class Distribution",
//   )
//   const airlineWidth = airlineSheet?.properties.gridProperties

//   const seaplaneSheet = response.sheets.find(
//     (sheet) => sheet.properties.title === "Seaplane Class Distribution",
//   )
//   const seaplaneWidth = seaplaneSheet?.properties.gridProperties

//   const helicopterSheet = response.sheets.find(
//     (sheet) => sheet.properties.title === "Helicopters",
//   )
//   const helicopterWidth = helicopterSheet?.properties.gridProperties

//   if (!airlineWidth || !seaplaneWidth || !helicopterWidth) {
//     throw new Error("Couldn't find sheets")
//   }

//   const dataResponse = await fetch(
//     `https://sheets.googleapis.com/v4/spreadsheets/${TRANSIT_SHEET_ID}/values:batchGet?` +
//       // rows[0] is the last row and cols[0] is last column
//       `ranges='Airline Class Distribution'!A3:C${airlineWidth.rowCount}` + // airports
//       `&ranges='Airline Class Distribution'!E2:${airlineWidth.columnCount}2` + // company names
//       `&ranges='Airline Class Distribution'!E3:${airlineWidth.columnCount}${airlineWidth.rowCount}` + // actual flight numbers
//       // same scheme here
//       `&ranges='Helicopters'!A2:C${helicopterWidth.rowCount}` + // heliports
//       `&ranges='Helicopters'!E1:${helicopterWidth.columnCount}1` + // companynames
//       `&ranges='Helicopters'!E2:${helicopterWidth.columnCount}${helicopterWidth.rowCount}` + // actual flight numbers
//       // and seaplanes
//       `&ranges='Seaplane Class Distribution'!A3:C${seaplaneWidth.rowCount}` + // heliports
//       `&ranges='Seaplane Class Distribution'!D2:${seaplaneWidth.columnCount}2` + // companynames
//       `&ranges='Seaplane Class Distribution'!D3:${seaplaneWidth.columnCount}${seaplaneWidth.rowCount}` + // actual flight numbers
//       `&key=${API_KEY}`,
//   ).then((r) => r.json() as Promise<SheetResponse>)

//   const transitSheet = dataResponse.valueRanges

//   const planes = parseRawFlightData(
//     ["PlaneFlight", "Airport"],
//     transitSheet[0]?.values,
//     transitSheet[1]?.values[0],
//     transitSheet[2]?.values,
//   )
//   const helis = parseRawFlightData(
//     ["HelicopterFlight", "Airport"],
//     transitSheet[3]?.values,
//     transitSheet[4]?.values[0],
//     transitSheet[5]?.values,
//   )
//   const sea = parseRawFlightData(
//     ["SeaplaneFlight", "Airport"],
//     transitSheet[6]?.values,
//     transitSheet[7]?.values[0],
//     transitSheet[8]?.values,
//   )

//   return {
//     routes: [...planes.routes, ...helis.routes, ...sea.routes],
//     connections: [
//       ...planes.connections,
//       ...helis.connections,
//       ...sea.connections,
//     ],
//     places: [...planes.places, ...helis.places, ...sea.places],
//     companies: [...planes.companies, ...helis.companies, ...sea.companies],
//   } satisfies {
//     places: BarePlace[]
//     companies: BareCompany[]
//     routes: BareRoute[]
//     connections: BareConnection[]
//   }
// }

// function parseRawFlightData(
//   [routeType, placeType]: [RouteType, PlaceType],
//   placesRaw: string[][] | undefined,
//   providersRaw: string[] | undefined,
//   routesRaw: string[][] | undefined,
// ) {
//   if (!placesRaw || !providersRaw || !routesRaw)
//     return {
//       places: [],
//       companies: [],
//       routes: [],
//       connections: [],
//     }

//   // cut off the row that starts with "Total Flights" and any rows after that
//   const indexOfLastRow = placesRaw.findIndex((row) =>
//     row.some((cell) => cell.startsWith("Total Flights")),
//   )

//   const places = placesRaw.slice(0, indexOfLastRow).map((place) => {
//     if (place.length === 0) return null
//     const shortName = place[1]
//     const longName = place[0]
//     const id = shortName?.length ? shortName : longName
//     const world_name = place[2] === "New" ? "New" : "Old"

//     if (!id) throw new Error(`No ID for place ${JSON.stringify(place)}`)

//     return {
//       IATA: shortName ?? id,
//       id,
//       name: longName ?? id,
//       shortName: shortName ?? id,
//       type: placeType,
//       worldName: world_name,
//     } satisfies BarePlace
//   })

//   const companies = providersRaw.map(
//     (provider) =>
//       ({
//         color_dark: null,
//         color_light: null,
//         id: encodeURIComponent(provider.trim()),
//         name: provider,
//       }) satisfies BareCompany,
//   )

//   const routes: BareRoute[] = []
//   const connections: BareConnection[] = []

//   for (const [rowNum, row] of routesRaw.slice(0, indexOfLastRow).entries()) {
//     for (const [colNum, col] of row.entries()) {
//       const company = companies[colNum]
//       const place = places[rowNum]
//       const flightNumbers = col.split(",").map((s) => s.trim())
//       if (company && place && col)
//         for (const flightNumber of flightNumbers) {
//           const route = {
//             id: `${company.id}-${flightNumber}`,
//             name: `${company.name} flight ${flightNumber}`,
//             companyId: company.id,
//             number: flightNumber,
//             type: routeType,
//           } satisfies BareRoute
//           routes.push(route)

//           const stop = {} satisfies BareConnection
//           connections.push(stop)
//         }
//     }
//   }

//   return {
//     places: places.filter(Boolean),
//     companies,
//     routes,
//     connections,
//   }
// }
export {}
