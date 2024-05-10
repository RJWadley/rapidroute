import { env } from "(temp)/env.mjs"
import type { RouteType, WorldName } from "@prisma/client"
import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet"
import { GoogleSpreadsheet } from "google-spreadsheet"

import type {
	BareCompany,
	BarePlace,
	BareRoute,
	BareSpoke,
} from "./temporaryDatabase"

const TRANSIT_SHEET_ID = "1wzvmXHQZ7ee7roIvIrJhkP6oCegnB8-nefWpd8ckqps"

const doc = new GoogleSpreadsheet(TRANSIT_SHEET_ID, {
	apiKey: env.GOOGLE_SHEETS_API_KEY,
})

const processWorldName = (rowText: string): WorldName => {
	if (rowText.toLowerCase().includes("new")) return "New"
	if (rowText.toLowerCase().includes("old")) return "Old"
	if (rowText.toLowerCase().includes("space")) return "Space"
	return "New"
}

const parseCellValue = (cell: unknown) =>
	typeof cell === "string" ? cell : undefined

const isLastRow = (rowText: string) =>
	rowText.toLowerCase().includes("total flights")

const processSheet = async (
	sheet: GoogleSpreadsheetWorksheet | undefined,
	{
		airlineNameRowIndex,
		firstColumnIndex,
	}: { airlineNameRowIndex: number; firstColumnIndex: number },
	type: RouteType,
) => {
	console.log("starting", type)
	if (!sheet) throw new Error("Couldn't find sheet")
	const rows = await sheet.getRows()

	const places: BarePlace[] = []

	// routes[airlineName][routeNumber] = [placeId]
	const routeData: Record<string, Record<string, string[]>> = {}

	// load the whole sheet
	await sheet.loadCells(
		`A${airlineNameRowIndex + 1}:${sheet.lastColumnLetter}${sheet.rowCount}`,
	)

	const airlineNames: string[] = []
	for (let i = firstColumnIndex; i < sheet.columnCount; i++) {
		const cell = sheet.getCell(airlineNameRowIndex, i)
		const value = parseCellValue(cell.value)
		airlineNames.push(value ?? "")
	}

	for (const row of rows) {
		const name = parseCellValue(row.get("Airport Name"))
		const code = parseCellValue(row.get("Code"))
		const world = parseCellValue(row.get("World"))
		if (name && isLastRow(name)) break

		// iterate through the columns and save routes
		for (let i = firstColumnIndex; i < sheet.columnCount; i++) {
			const cell = sheet.getCell(row.rowNumber - 1, i)
			const value = parseCellValue(cell.value)
			const flights = value?.split(",").map((s) => s.trim()) ?? []
			const airlineName = airlineNames[i]

			if (!airlineName || !name) continue

			for (const flightNumber of flights) {
				routeData[airlineName] = {
					...routeData[airlineName],
					[flightNumber]: [
						...(routeData[airlineName]?.[flightNumber] ?? []),
						code ?? name,
					],
				}
			}
		}

		if (name)
			places.push({
				name,
				id: code ?? name,
				type: "Airport",
				IATA: code,
				worldName: processWorldName(world ?? ""),
			})
	}

	const spokes: BareSpoke[] = []
	const routes: BareRoute[] = []
	const companies: BareCompany[] = []

	for (const [company, routeInfo] of Object.entries(routeData)) {
		companies.push({
			id: encodeURIComponent(company),
			name: company,
		})

		for (const [routeNumber, routeDestinations] of Object.entries(routeInfo)) {
			routes.push({
				id: `${encodeURIComponent(company)}-${routeNumber}`,
				companyId: encodeURIComponent(company),
				number: routeNumber,
				type,
			})

			for (const destination of routeDestinations) {
				spokes.push({
					placeId: destination,
					routeId: `${encodeURIComponent(company)}-${routeNumber}`,
				})
			}
		}
	}

	console.log("finished", type)
	return { places, spokes, routes, companies }
}

export const getTransitSheetData = async () => {
	await doc.loadInfo()
	const airlines = doc.sheetsByTitle["Airline Class Distribution"]
	const helis = doc.sheetsByTitle.Helicopters
	const seaplanes = doc.sheetsByTitle["Seaplane Class Distribution"]

	const [airlinesRows, helisRows, seaplanesRows] = await Promise.all([
		processSheet(
			airlines,
			{
				airlineNameRowIndex: 1,
				firstColumnIndex: 4,
			},
			"PlaneFlight",
		),
		processSheet(
			helis,
			{
				airlineNameRowIndex: 0,
				firstColumnIndex: 4,
			},
			"HelicopterFlight",
		),
		processSheet(
			seaplanes,
			{
				airlineNameRowIndex: 1,
				firstColumnIndex: 3,
			},
			"SeaplaneFlight",
		),
	])

	return [airlinesRows, helisRows, seaplanesRows]
}
