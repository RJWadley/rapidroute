import { data } from "./validation"

const allNodes = Object.values(data.nodes)

/**
 * get a pretty id for a place, for use in the page URL
 */
const usedIds: Record<string, boolean> = {}
const getPrettyId = (place: UglyPlace) => {
	const id: string = (() => {
		switch (place.type) {
			case "AirAirport":
				return place.code
			case "RailStation":
			case "SeaStop":
			case "BusStop": {
				const company = place.company ? data.nodes[place.company] : null
				if (!company)
					throw new Error(`undefined company reference: ${place.company}`)
				if (
					!(
						company.type === "BusCompany" ||
						company.type === "RailCompany" ||
						company.type === "SeaCompany"
					)
				)
					throw new Error(`invalid company reference type: ${place.company}`)

				const code = place.codes?.join("-")

				return `${company.name}-${code || place.name || place.i}`
			}
			case "Town":
				return place.name
			default:
				place satisfies never
				return ""
		}
	})()

	if (usedIds[id]) {
		let i = 1
		while (usedIds[`${id} ${i}`]) {
			i++
		}

		usedIds[`${id} ${i}`] = true
		return `${id} ${i}`
	}

	usedIds[id] = true
	return id
}

/**
 * PLACES
 */
const uglyPlacesArray = allNodes.filter(
	(place) =>
		place.type === "AirAirport" ||
		place.type === "BusStop" ||
		place.type === "RailStation" ||
		place.type === "SeaStop" ||
		place.type === "Town",
)
type UglyPlace = (typeof uglyPlacesArray)[number]

const placesArray = uglyPlacesArray.map((place) => ({
	...place,
	pretty_id: getPrettyId(place),
}))

export const places = {
	list: placesArray,
	map: new Map(placesArray.map((place) => [place.i, place])),
}
export type Place = (typeof placesArray)[number]

/**
 * GATES
 */
const gatesArray = allNodes.filter((place) => place.type === "AirGate")

export const gates = {
	list: gatesArray,
	map: new Map(gatesArray.map((gate) => [gate.i, gate])),
}
export type Gate = (typeof gatesArray)[number]

/**
 * flights
 */
const flightsArray = allNodes.filter((place) => place.type === "AirFlight")

export const flights = {
	list: flightsArray,
	map: new Map(flightsArray.map((flight) => [flight.i, flight])),
}
export type Flight = (typeof flightsArray)[number]

/**
 * companies
 */
const companiesArray = allNodes.filter(
	(place) =>
		place.type === "AirAirline" ||
		place.type === "RailCompany" ||
		place.type === "SeaCompany" ||
		place.type === "BusCompany",
)

export const companies = {
	list: companiesArray,
	map: new Map(companiesArray.map((company) => [company.i, company])),
}
export type Company = (typeof companiesArray)[number]

/**
 * non-air connections
 */
const connectionLinesArray = allNodes.filter(
	(place) =>
		place.type === "RailLine" ||
		place.type === "SeaLine" ||
		place.type === "BusLine",
)

export const connectionLines = {
	list: connectionLinesArray,
	map: new Map(connectionLinesArray.map((line) => [line.i, line])),
}
export type ConnectionLine = (typeof connectionLinesArray)[number]
