import { expect, test } from "bun:test"
import type { DataType } from "app/data"
import superjson from "superjson"
import { cityRankColors } from "./cityRankColors"
import { getCompressedPlaces } from "./compressedPlaces"
import { getDistinctCodes, getTextboxName } from "./displayNames"
import { findClosestPlace, search } from "./search"

const data = {
	places: {
		list: [
			{
				type: "Town",
				pretty_id: "Test+City",
				name: "Test City",
				world: "New",
				rank: "Mayor",
				mayor: "Alice",
				deputy_mayor: "",
				coordinates: [0, 0],
			},
			{
				type: "RailStation",
				pretty_id: "R1",
				codes: ["R1", " "],
				company: "rail",
				world: "New",
				connections: { a: [{ line: "line" }] },
				coordinates: undefined,
			},
			{
				type: "AirAirport",
				pretty_id: "AIR",
				code: "AIR",
				name: "Airport",
				world: "Old",
				modes: [],
				coordinates: [1, 2],
			},
			{
				type: "BusStop",
				pretty_id: "bus",
				codes: [],
				company: "missing",
				world: "New",
				coordinates: undefined,
			},
			{ type: "SpawnWarp", pretty_id: "excluded" },
		],
	},
	companies: {
		map: new Map([["rail", { type: "RailCompany", name: "Rail" }]]),
	},
	connectionLines: {
		map: new Map([["line", { type: "RailLine", code: "R", color: "#123456" }]]),
	},
} as unknown as DataType

test("defined values survive SuperJSON, undefined keys are absent", () => {
	const places = getCompressedPlaces(data)
	expect(places).toHaveLength(4)
	expect(superjson.parse<typeof places>(superjson.stringify(places))).toEqual(
		places,
	)
	expect(superjson.serialize(places).meta).toBeUndefined()
	expect(places[0]?.coordinates).toEqual([0, 0])
	expect(places[0]?.deputy_mayor).toBe("")
	expect(places[2]?.modes).toEqual([])
	expect(places[3]?.codes).toEqual([])
	expect(places[1]?.nameIsCode).toBe(true)
	expect(places[1]?.codeColors).toEqual({ R1: "#123456" })
	expect(places[1]?.company).toEqual({ type: "RailCompany", name: "Rail" })
	expect(places[3]).not.toHaveProperty("company")
	expect(places[1]).not.toHaveProperty("coordinates")
})
test("search, city display and wiki destination fields retain their behavior", () => {
	const places = getCompressedPlaces(data)
	const city = findClosestPlace("Test+City", places)
	expect(city).toEqual(places[0])
	expect(getTextboxName(city)).toBe("Mayor City - Test City")
	const rank = places[0]?.rank
	if (!rank) throw new Error("missing city rank")
	expect(cityRankColors[rank]).toBe("#0000ff")
	expect(search("Alice", places, [])?.[0]?.obj).toEqual(places[0])
	const rail = places[1]
	if (!rail) throw new Error("missing rail station")
	expect(getDistinctCodes(rail)).toEqual([])
	const station = findClosestPlace("R1", places)
	expect(
		station && station.type !== "Coordinate"
			? {
					id: station.id,
					type: station.type,
					codes: station.codes,
					company: station.company?.name,
					world: station.world,
					coordinates: station.coordinates,
					mayor: station.mayor,
				}
			: null,
	).toEqual({
		id: "R1",
		type: "RailStation",
		codes: ["R1"],
		company: "Rail",
		world: "New",
		coordinates: undefined,
		mayor: undefined,
	})
})

test("legacy undefined metadata normalizes to the same serialized values", () => {
	const places = getCompressedPlaces(data)
	const optional = [
		"nameIsCode",
		"codes",
		"modes",
		"company",
		"rank",
		"mayor",
		"deputy_mayor",
		"coordinates",
		"codeColors",
	]
	const legacy = places.map((place) =>
		Object.assign(
			Object.fromEntries(optional.map((key) => [key, undefined])),
			place,
		),
	)
	const normalize = (value: unknown) => JSON.parse(JSON.stringify(value))
	expect(normalize(superjson.parse(superjson.stringify(legacy)))).toEqual(
		superjson.parse(superjson.stringify(places)),
	)
	expect(superjson.stringify(places).length).toBeLessThan(
		superjson.stringify(legacy).length,
	)
})
