import { z } from "zod"

import RawData from "../gatelogue/data_no_sources.json"

// all this schema is primarily to verify the data is of the type I'm expecting,
// and helps me to understand the data structure better and its relationships

const id = (
	type:
		| "air.flight"
		| "air.airport"
		| "air.gate"
		| "air.airline"
		| "rail.company"
		| "rail.line"
		| "rail.station"
		| "sea.company"
		| "sea.line"
		| "sea.stop"
		| "bus.company"
		| "bus.line"
		| "bus.stop"
		| "town.town",
) => z.string()
// verify that the id can be found in the corresponding data if desired
// .refine((id) => {
// 	const [upper, lower] = type.split(".")
// 	return (
// 		upper && lower && typeof RawData?.[upper]?.[lower][id] !== "undefined"
// 	)
// })

const connections = z.record(
	z.string(),
	z.array(
		z.strictObject({
			line: z.string(),
			direction: z.strictObject({
				forward_towards_code: z.string(),
				forward_direction_label: z.string(),
				backward_direction_label: z.string(),
				one_way: z.boolean(),
			}),
		}),
	),
)

const location = z.strictObject({
	coordinates: z.tuple([z.number(), z.number()]).nullable(),
	world: z.enum(["New", "Old"]).nullable(),
	proximity: z.record(
		z.enum(["railstation", "seastop", "airairport", "busstop", "town"]),
		z.record(
			z.string(),
			z.strictObject({
				distance: z.number(),
			}),
		),
	),
	name: z.string().nullable(),
})

const flight = z.strictObject({
	codes: z.array(z.string()),
	gates: z.array(id("air.gate")),
	airline: id("air.airline"),
})
export type Flight = z.infer<typeof flight>

const airport = location.extend({
	code: z.string(),
	link: z.string().url().nullable(),
	gates: id("air.gate").array(),
})
export type Airport = z.infer<typeof airport>

const gate = z.strictObject({
	code: z.string().nullable(),
	flights: id("air.flight").array(),
	airport: id("air.airport"),
	airline: id("air.airline").nullable(),
	size: z.enum(["H", "XS", "S", "MS", "M", "ML", "L"]).nullable(),
})
export type Gate = z.infer<typeof gate>

const airline = z.strictObject({
	name: z.string(),
	flights: id("air.flight").array(),
	link: z.string().url().nullable(),
})
export type Airline = z.infer<typeof airline>

const railCompany = z.strictObject({
	name: z.string(),
	lines: id("rail.line").array(),
	stations: id("rail.station").array(),
})
export type RailCompany = z.infer<typeof railCompany>

const railLine = z.strictObject({
	code: z.string(),
	company: id("rail.company"),
	ref_station: id("rail.station").nullable(),
	mode: z.enum(["warp"]).nullable(),
	name: z.string(),
	colour: z.string().nullable(),
})
export type RailLine = z.infer<typeof railLine>

const railStation = location.extend({
	codes: z.string().array(),
	company: id("rail.company"),
	connections,
})

const seaCompany = z.strictObject({
	name: z.string(),
	lines: z.array(id("sea.line")),
	stops: z.array(id("sea.stop")),
})
export type SeaCompany = z.infer<typeof seaCompany>

const seaLine = z.strictObject({
	code: z.string(),
	company: id("sea.company"),
	ref_stop: id("sea.stop").nullable(),
	mode: z.enum(["ferry"]).nullable(),
	name: z.string().nullable(),
	colour: z.string().nullable(),
})
export type SeaLine = z.infer<typeof seaLine>

const seaStop = location.extend({
	codes: z.array(z.string()),
	company: id("sea.company"),
	connections,
})
export type SeaStop = z.infer<typeof seaStop>

const busCompany = z.strictObject({
	name: z.string(),
	lines: z.array(id("bus.line")),
	stops: z.array(id("bus.stop")),
})
export type BusCompany = z.infer<typeof busCompany>

const busLine = z.strictObject({
	code: z.string(),
	company: id("bus.company"),
	ref_stop: id("bus.stop").nullable(),
	name: z.string().nullable(),
	colour: z.string().nullable(),
})
export type BusLine = z.infer<typeof busLine>

const busStop = location.extend({
	codes: z.array(z.string()),
	company: id("bus.company"),
	connections,
})
export type BusStop = z.infer<typeof busStop>

const town = location.extend({
	rank: z.enum([
		"Premier",
		"Governor",
		"Senator",
		"Mayor",
		"Councillor",
		"Community",
		"Unranked",
	]),
	mayor: z.string().nullable(),
	deputy_mayor: z.string().nullable(),
})

const schema = z
	.strictObject({
		air: z.strictObject({
			flight: z.record(id("air.flight"), flight),
			airport: z.record(id("air.airport"), airport),
			gate: z.record(id("air.gate"), gate),
			airline: z.record(id("air.airline"), airline),
		}),
		rail: z.strictObject({
			company: z.record(id("rail.company"), railCompany),
			line: z.record(id("rail.line"), railLine),
			station: z.record(id("rail.station"), railStation),
		}),
		sea: z.strictObject({
			company: z.record(id("sea.company"), seaCompany),
			line: z.record(id("sea.line"), seaLine),
			stop: z.record(id("sea.stop"), seaStop),
		}),
		bus: z.strictObject({
			company: z.record(id("bus.company"), busCompany),
			line: z.record(id("bus.line"), busLine),
			stop: z.record(id("bus.stop"), busStop),
		}),
		town: z.strictObject({
			town: z.record(id("town.town"), town),
		}),
		timestamp: z.string(),
		version: z.literal(2),
	})
	.readonly()

const data = schema.parse(RawData)

const usedIds: Record<string, boolean> = {}
const getPlaceId = (place: {
	code?: string | null
	codes?: string[] | null
	name?: string | null
	type?: string | null
}) => {
	const codes =
		"code" in place && place.code
			? [place.code]
			: "codes" in place && place.codes
				? place.codes
				: undefined
	const name = place.name

	const id = codes ? codes.join(", ") : name || `Untitled ${place.type}`

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

const placesArray = [
	...Object.entries(data.air.airport).map(
		([id, airport]) =>
			({
				id,
				type: "airport",
				...airport,
			}) as const,
	),
	...Object.entries(data.rail.station).map(
		([id, station]) =>
			({
				id,
				type: "railstation",
				...station,
			}) as const,
	),
	...Object.entries(data.sea.stop).map(
		([id, stop]) =>
			({
				id,
				type: "seastop",
				...stop,
			}) as const,
	),
	...Object.entries(data.bus.stop).map(
		([id, stop]) =>
			({
				id,
				type: "busstop",
				...stop,
			}) as const,
	),
	...Object.entries(data.town.town).map(
		([id, town]) =>
			({
				id,
				type: "town",
				...town,
			}) as const,
	),
].map((place) => ({
	...place,
	pretty_id: getPlaceId(place),
}))

const placesMap = new Map(
	placesArray.map((location) => [location.id, location]),
)

export type Place = (typeof placesArray)[number]
export const places = {
	list: placesArray,
	map: placesMap,
}

/**
 * gates
 */
const gatesArray = Object.entries(data.air.gate).map(
	([id, gate]) =>
		({
			id,
			type: "gate",
			...gate,
		}) as const,
)
const gatesMap = new Map(gatesArray.map((gate) => [gate.id, gate]))
export const gates = {
	list: gatesArray,
	map: gatesMap,
}

/**
 * flights
 */
const flightsArray = Object.entries(data.air.flight).map(
	([id, flight]) =>
		({
			id,
			type: "flight",
			...flight,
		}) as const,
)
const flightsMap = new Map(flightsArray.map((flight) => [flight.id, flight]))
export const flights = {
	list: flightsArray,
	map: flightsMap,
}

/**
 * companies
 */
const companiesArray = [
	...Object.entries(data.air.airline).map(
		([id, airline]) =>
			({
				id,
				type: "airline",
				...airline,
			}) as const,
	),
	...Object.entries(data.rail.company).map(
		([id, company]) =>
			({
				id,
				type: "railcompany",
				...company,
			}) as const,
	),
	...Object.entries(data.sea.company).map(
		([id, company]) =>
			({
				id,
				type: "seacompany",
				...company,
			}) as const,
	),
	...Object.entries(data.bus.company).map(
		([id, company]) =>
			({
				id,
				type: "buscompany",
				...company,
			}) as const,
	),
]

const companiesMap = new Map(
	companiesArray.map((company) => [company.id, company]),
)
export const companies = {
	list: companiesArray,
	map: companiesMap,
}

/**
 * non-air connections
 */
const connectionLinesArray = [
	...Object.entries(data.rail.line).map(
		([id, line]) =>
			({
				id,
				type: "railline",
				...line,
			}) as const,
	),
	...Object.entries(data.sea.line).map(
		([id, line]) =>
			({
				id,
				type: "sealine",
				...line,
			}) as const,
	),
	...Object.entries(data.bus.line).map(
		([id, line]) =>
			({
				id,
				type: "busline",
				...line,
			}) as const,
	),
]

const connectionLinesMap = new Map(
	connectionLinesArray.map((line) => [line.id, line]),
)

export const connectionLines = {
	list: connectionLinesArray,
	map: connectionLinesMap,
}
