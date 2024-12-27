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
			case "SpawnWarp":
				// warps are only used for routing - not display, so they don't need pretty ids
				return place.i
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
		place.type === "Town" ||
		place.type === "SpawnWarp",
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

/**
 * spawn warps
 */
const spawnWarpsArray = allNodes.filter((place) => place.type === "SpawnWarp")

export const spawnWarps = {
	list: spawnWarpsArray,
	map: new Map(spawnWarpsArray.map((warp) => [warp.i, warp])),
}
export type SpawnWarp = (typeof spawnWarpsArray)[number]

/**
 * route type/mode stuff
 */
export type RouteType =
	| "AirFlight"
	| "RailLine"
	| "SeaLine"
	| "BusLine"
	| "Walk"
	| "SpawnWarp"

type NodesOfType<T> = (typeof allNodes)[number] & { type: T }

type ExtractModes<T> = T extends {
	mode?: unknown
}
	? T["mode"]
	: never

export type ExcludedRoutes = {
	[Type in RouteType]: {
		[Mode in ExtractModes<NodesOfType<Type>> extends number
			? "unk"
			: ExtractModes<NodesOfType<Type>>]: boolean
	}
}

/**
 * some assertions about the data - so that I'll know if things change
 */
if (!flights.list.find((x) => x.mode === "unk"))
	throw new Error(
		"flights: unk mode specified but not found. it should be removed from the schema",
	)
if (
	!connectionLines.list
		.filter((x) => x.type === "RailLine")
		.find((x) => x.mode === "unk")
)
	throw new Error(
		"rail: unk mode specified but not found. it should be removed from the schema",
	)
if (
	!connectionLines.list
		.filter((x) => x.type === "SeaLine")
		.find((x) => x.mode === "unk")
)
	throw new Error(
		"sea: unk mode specified but not found. it should be removed from the schema",
	)
