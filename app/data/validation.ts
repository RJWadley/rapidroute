import { z } from "zod"
import BritishData from "../../gatelogue/data_no_sources.json"
import { isServer, isWorker } from "app/utils/isBrowser"

// validate that we are either on the server OR in a web worker
if (!isServer && !isWorker) {
	throw new Error("raw gatelogue data was imported in a non-worker environment")
}

const RawData = JSON.parse(
	// gotta save those bytes
	JSON.stringify(BritishData).replaceAll("colour", "color"),
)

// all this schema is primarily to verify the data is of the type I'm expecting,
// and helps me to understand the data structure better and its relationships

/**
 * as of dec 2024, removing nulls during serialization saves ~130KB
 */
const optional = <T>(schema: z.ZodType<T>) =>
	schema
		.nullable()
		.optional()
		.transform((v) => (v === null ? undefined : v))

/**
 * each node has a unique identifier
 */
const id = z
	.union([z.number(), z.string()])
	// id must be an integer
	.refine((v) => v.toString().match(/^\d+$/))
	// it doesn't matter if we choose a string or a number, as long as it's the same everywhere
	// because object keys serialize to strings, I'm going with strings always
	.transform((v) => (typeof v === "number" ? v.toString() : v))

/**
 * data sources, in order
 */
const source = z
	.string()
	.array()
	.min(1)
	// we don't consume these sources
	.transform((v) => undefined)

/**
 * coordinates of a node in its respective world, if available
 */
const coordinates = optional(z.tuple([z.number(), z.number()]))

/**
 * nearby nodes, with distances
 */
const proximity = z.record(
	id,
	z.strictObject({
		distance: z
			.number()
			.transform((v) =>
				// no reason to keep decimals - save some bytes
				Math.round(v),
			)
			// if two places are at the same spot, we could bounce between them with no penalty
			// so proximity should be at least 1, event though it could be 0
			.transform((v) => Math.min(v, 1)),
	}),
)

/**
 * airports have unique codes
 */
const uniqueCode = z.string().refine((v) =>
	// code must be unique
	{
		const matches =
			// @ts-expect-error
			Object.values(RawData.nodes).filter((node) => node.code === v)

		if (matches.length === 1) return true

		console.warn(`code ${v} is not unique`, matches)
		return false
	},
)

const world =
	// TODO: PMA is not a valid world
	optional(
		z.enum(["New", "Old", "PMA"]).transform((v) => (v === "PMA" ? "New" : v)),
	)

const connections = z.record(
	id,
	z
		.strictObject({
			line: id,
			direction: z.strictObject({
				direction: id,
				forward_label: z.string(),
				backward_label: z.string(),
				one_way: z.boolean(),
			}),
		})
		.array(),
)

const shared_facility = id.array()

const emptyStringOLD = z.literal("")
const requiredString = z.string().min(1)
const optionalString = optional(
	z.string().transform((v) => (v === "" ? null : v)),
)

const schema = z
	.strictObject({
		nodes: z.record(
			id,
			z.discriminatedUnion("type", [
				z.strictObject({
					type: z.literal("AirAirline"),
					i: id,
					name: requiredString,
					link: optionalString,
					flights: z.array(id),
					gates: z.array(id),
					source,
				}),
				z.strictObject({
					type: z.literal("AirAirport"),
					i: id,
					source,
					coordinates,
					world,
					proximity,
					shared_facility,
					code: uniqueCode,
					name: optionalString,
					link: optionalString,
					modes: optional(
						z.enum(["seaplane", "helicopter", "plane"]).array().min(1),
					),
					gates: id.array(),
				}),
				z.strictObject({
					type: z.literal("AirGate"),
					i: id,
					source,
					code: optionalString,
					size: optional(z.enum(["SP", "H", "MS", "S", "ML", "XS", "M", "L"])),
					flights: id.array(),
					airport: id,
					airline: optional(id),
				}),
				z.strictObject({
					type: z.literal("AirFlight"),
					i: id,
					source,
					codes: requiredString.array().min(1),
					// TODO: should mode be defined?
					mode: optional(z.null()),
					gates: id.array().min(1),
					airline: id,
				}),
				z.strictObject({
					type: z.literal("RailLine"),
					i: id,
					source,
					code: requiredString,
					name: requiredString,
					color: optionalString,
					mode: optional(z.enum(["warp"])),
					company: id,
					ref_station: optional(id),
				}),
				z.strictObject({
					type: z.literal("RailCompany"),
					i: id,
					source,
					name: requiredString,
					lines: id.array().min(1),
					stations: id.array().min(1),
				}),
				z.strictObject({
					type: z.literal("RailStation"),
					i: id,
					source,
					coordinates,
					world,
					proximity,
					shared_facility,
					codes: requiredString.array().min(1),
					name: optionalString,
					company: id,
					connections,
				}),
				z.strictObject({
					type: z.literal("SeaLine"),
					i: id,
					source,
					code: requiredString,
					name: requiredString,
					color: optionalString,
					mode: optional(z.enum(["ferry"])),
					company: id,
					ref_stop: optional(id),
				}),
				z.strictObject({
					type: z.literal("SeaStop"),
					i: id,
					source,
					coordinates,
					world,
					proximity,
					shared_facility,
					codes: requiredString.array().min(1),
					name: optionalString,
					company: id,
					connections,
				}),
				z.strictObject({
					type: z.literal("SeaCompany"),
					i: id,
					source,
					name: requiredString,
					lines: id.array().min(1),
					stops: id.array().min(1),
				}),
				z.strictObject({
					type: z.literal("BusLine"),
					i: id,
					source,
					code: requiredString,
					name: optionalString,
					color: optionalString,
					company: id,
					ref_stop: optional(id),
				}),
				z.strictObject({
					type: z.literal("BusStop"),
					i: id,
					source,
					coordinates,
					world,
					proximity,
					shared_facility,
					codes: optional(
						z.union([
							requiredString.array().min(1),
							z.tuple([z.literal("")]).transform(() => null),
						]),
					),
					name: optionalString,
					company: id,
					connections,
				}),
				z.strictObject({
					type: z.literal("BusCompany"),
					i: id,
					source,
					name: requiredString,
					lines: id.array(),
					stops: id.array(),
				}),
				z.strictObject({
					type: z.literal("Town"),
					i: id,
					source,
					coordinates,
					world,
					proximity,
					shared_facility,
					name: requiredString,
					rank: z.enum([
						"Premier",
						"Governor",
						"Senator",
						"Mayor",
						"Councillor",
						"Community",
						"Unranked",
						// TODO - what is this?
						"nan",
					]),
					mayor: requiredString,
					deputy_mayor: optionalString,
				}),
			]),
		),
		timestamp: z.string(),
		version: z.number(),
	})
	.readonly()

// const byteSize = (str: string) => new Blob([str]).size

// globalThis.allowNull = true
// const dataWithNull = schema.parse(RawData)
// globalThis.allowNull = false
const data = schema.parse(RawData)

// console.info("data is valid")

// const startingSize = Math.round(byteSize(JSON.stringify(BritishData)) / 1000)
// const sizeWithNull = Math.round(byteSize(JSON.stringify(dataWithNull)) / 1000)
// const sizeWithoutNull = Math.round(JSON.stringify(data).length / 1000)

// console.info(`parsing saved ${startingSize - sizeWithNull} KB`)
// console.info(
// 	`parsing with null removal saves ${startingSize - sizeWithoutNull} KB (${sizeWithoutNull - sizeWithNull} KB)`,
// )

export { data }
