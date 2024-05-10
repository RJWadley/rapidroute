export interface City {
	"Town Name": number | string
	"Town Rank": TownRank
	Mayor: string
	"Deputy Mayor": string
	X: number
	Y: number
	Z: number
	"/tppos": string
	"MRT Station(s)": string
	"Former Mayors": string
	Notes: string
}

export type TownRank =
	| "Community"
	| "Councillor"
	| "Governor"
	| "Mayor"
	| "Premier"
	| "Senator"
	| "Unranked"

const citiesURL =
	"https://script.google.com/macros/s/AKfycbwde4vwt0l4_-qOFK_gL2KbVAdy7iag3BID8NWu2DQ1566kJlqyAS1Y/exec?spreadsheetId=1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI&sheetName=New%20World"

export function getCities() {
	return fetch(citiesURL).then((res) => res.json() as Promise<City[]>)
}
