import {
  BarePlace,
  BareProvider,
  BareRoute,
  BareRoutePlace,
} from "types/aliases"
import { PropertiesResponse, SheetResponse } from "types/googleSheets"
import { updateRoutePlaces, updateThing } from "updater/utils/updateThing"

const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps"
const API_KEY = "AIzaSyCrrcWTs3OKgyc8PVXAKeYaotdMiRqaNO8"

export async function importTransitSheet() {
  // get the grid properties of the "Airline Class Distribution", "Seaplane Class Distribution", and "Helicopters" sheets
  const response = (await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" +
      TRANSIT_SHEET_ID +
      "?key=" +
      API_KEY +
      "&fields=sheets.properties(title,gridProperties)"
  ).then((r) => r.json())) as PropertiesResponse

  const airlineSheet = response.sheets.find(
    (sheet) => sheet.properties.title === "Airline Class Distribution"
  )
  const airlineWidth = airlineSheet?.properties.gridProperties

  const seaplaneSheet = response.sheets.find(
    (sheet) => sheet.properties.title === "Seaplane Class Distribution"
  )
  const seaplaneWidth = seaplaneSheet?.properties.gridProperties

  const helicopterSheet = response.sheets.find(
    (sheet) => sheet.properties.title === "Helicopters"
  )
  const helicopterWidth = helicopterSheet?.properties.gridProperties

  if (!airlineWidth || !seaplaneWidth || !helicopterWidth) {
    throw new Error("Couldn't find sheets")
  }

  const dataResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${TRANSIT_SHEET_ID}/values:batchGet?` +
      // rows[0] is the last row and cols[0] is last column
      `ranges='Airline Class Distribution'!A3:C${airlineWidth.rowCount}` + // airports
      `&ranges='Airline Class Distribution'!E2:${airlineWidth.columnCount}2` + // company names
      `&ranges='Airline Class Distribution'!E3:${airlineWidth.columnCount}${airlineWidth.rowCount}` + // actual flight numbers
      // same scheme here
      `&ranges='Helicopters'!A2:C${helicopterWidth.rowCount}` + // heliports
      `&ranges='Helicopters'!E1:${helicopterWidth.columnCount}1` + // companynames
      `&ranges='Helicopters'!E2:${helicopterWidth.columnCount}${helicopterWidth.rowCount}` + // actual flight numbers
      // and seaplanes
      `&ranges='Seaplane Class Distribution'!A3:C${seaplaneWidth.rowCount}` + // heliports
      `&ranges='Seaplane Class Distribution'!D2:${seaplaneWidth.columnCount}2` + // companynames
      `&ranges='Seaplane Class Distribution'!D3:${seaplaneWidth.columnCount}${seaplaneWidth.rowCount}` + // actual flight numbers
      `&key=${API_KEY}`
  ).then((r) => r.json() as Promise<SheetResponse>)

  const transitSheet = dataResponse.valueRanges

  await parseRawFlightData(
    "flight",
    transitSheet[0]?.values,
    transitSheet[1]?.values[0],
    transitSheet[2]?.values
  )
  await parseRawFlightData(
    "heli",
    transitSheet[3]?.values,
    transitSheet[4]?.values[0],
    transitSheet[5]?.values
  )
  await parseRawFlightData(
    "seaplane",
    transitSheet[6]?.values,
    transitSheet[7]?.values[0],
    transitSheet[8]?.values
  )
}

async function parseRawFlightData(
  mode: string,
  placesRaw: string[][] | undefined,
  providersRaw: string[] | undefined,
  routesRaw: string[][] | undefined
) {
  if (!placesRaw || !providersRaw || !routesRaw) return

  // cut off the row that starts with "Total Flights" and any rows after that
  const indexOfLastRow = placesRaw.findIndex((row) =>
    row.some((cell) => cell.startsWith("Total Flights"))
  )

  const places = placesRaw.slice(0, indexOfLastRow).map((place) => {
    if (place.length === 0) return null
    const shortName = place[1]
    const longName = place[0]
    const id = shortName?.length ? shortName : longName
    const world_name = place[2]

    if (!id) throw new Error("No ID for place " + JSON.stringify(place))

    return {
      description: null,
      enabled: true,
      IATA: shortName ?? id,
      id,
      manual_keys: [],
      name: longName ?? id,
      short_name: shortName ?? id,
      type: mode,
      world_name: world_name ?? "New",
      x: null,
      z: null,
    } satisfies BarePlace
  })

  const providers = providersRaw.map(
    (provider) =>
      ({
        color_dark: null,
        color_light: null,
        id: encodeURIComponent(provider.trim()),
        logo: null,
        manual_keys: [],
        name: provider,
        number_prefix: null,
        operators: null,
      } satisfies BareProvider)
  )

  const placePromises = places.map((place) => {
    return place ? updateThing("place", place) : Promise.resolve()
  })
  const providerPromises = providers.map((provider) =>
    updateThing("provider", provider)
  )

  await Promise.all([...placePromises, ...providerPromises])

  const routePromises: Promise<void>[] = []
  const stopPromises: Promise<void>[] = []

  for (const [rowNum, row] of routesRaw.slice(0, indexOfLastRow).entries()) {
    for (const [colNum, col] of row.entries()) {
      const provider = providers[colNum]
      const place = places[rowNum]
      const flightNumbers = col.split(",").map((s) => s.trim())
      if (provider && place && col)
        for (const flightNumber of flightNumbers) {
          const route = {
            id: `${provider.id}-${flightNumber}`,
            manual_keys: [],
            name: `${provider.name} flight ${flightNumber}`,
            provider: provider.id,
            num_gates: null,
            number: flightNumber,
            type: mode,
          } satisfies BareRoute
          routePromises.push(updateThing("route", route))

          const stop = {
            gate: null,
            manual_keys: [],
            place: place.id,
            route: route.id,
          } satisfies BareRoutePlace

          stopPromises.push(updateRoutePlaces(stop))
        }
    }
  }

  await Promise.all([...routePromises, ...stopPromises])
}
