import { z } from "zod"

import RawData from "../gatelogue/data_no_sources.json"

const connections = z.record(
	z.string(),
	z.array(
		z.strictObject({
			line: z.string(),
			direction: z.strictObject({
				forward_towards_code: z.strictObject({
					id: z.string(),
				}),
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
		z.enum(["railstation", "seastop", "airairport", "busstop"]),
		z.record(
			z.string().uuid(),
			z.strictObject({
				distance: z.number(),
			}),
		),
	),
	name: z.string().nullable(),
})

const schema = z.strictObject({
	air: z.strictObject({
		flight: z.record(
			z.string().uuid(),
			z.strictObject({
				codes: z.array(z.string()),
				gates: z.array(z.string()),
				airline: z.string(),
			}),
		),
		airport: z.record(
			z.string().uuid(),
			location.extend({
				code: z.string(),
				link: z.string().url().nullable(),
				gates: z.string().array(),
			}),
		),
		gate: z.record(
			z.string(),
			z.strictObject({
				code: z.string().nullable(),
				flights: z.string().array(),
				airport: z.string(),
				airline: z.string().nullable(),
				size: z.enum(["H", "XS", "S", "MS", "M", "ML"]).nullable(),
			}),
		),
		airline: z.record(
			z.string(),
			z.strictObject({
				name: z.string(),
				flights: z.string().array(),
				link: z.string().url().nullable(),
			}),
		),
	}),
	rail: z.strictObject({
		company: z.record(
			z.string(),
			z.strictObject({
				name: z.string(),
				lines: z.string().array(),
				stations: z.string().array(),
			}),
		),
		line: z.record(
			z.string(),
			z.strictObject({
				code: z.string(),
				company: z.string(),
				ref_station: z.string().nullable(),
				mode: z.enum(["warp"]).nullable(),
				name: z.string(),
				colour: z.string().nullable(),
			}),
		),
		station: z.record(
			z.string(),
			location.extend({
				codes: z.string().array(),
				company: z.string(),
				connections,
			}),
		),
	}),
	sea: z.strictObject({
		company: z.record(
			z.string(),
			z.strictObject({
				name: z.string(),
				lines: z.array(z.string()),
				stops: z.array(z.string()),
			}),
		),
		line: z.record(
			z.string(),
			z.strictObject({
				code: z.string(),
				company: z.string(),
				ref_stop: z.string().nullable(),
				mode: z.enum(["ferry"]).nullable(),
				name: z.string().nullable(),
				colour: z.string().nullable(),
			}),
		),
		stop: z.record(
			z.string(),
			location.extend({
				codes: z.array(z.string()),
				company: z.string(),
				connections,
			}),
		),
	}),
	bus: z.strictObject({
		company: z.record(
			z.string(),
			z.strictObject({
				name: z.string(),
				lines: z.array(z.string()),
				stops: z.array(z.string()),
			}),
		),
		line: z.record(
			z.string(),
			z.strictObject({
				code: z.string(),
				company: z.string(),
				ref_stop: z.string().nullable(),
				name: z.string().nullable(),
				colour: z.string().nullable(),
			}),
		),
		stop: z.record(
			z.string(),
			location.extend({
				codes: z.array(z.string()),
				company: z.string(),
				connections,
			}),
		),
	}),
	timestamp: z.string(),
	version: z.literal(1),
})

const parsed = schema.safeParse(RawData)

if (parsed.success) {
	console.log("data is valid!")
} else {
	console.log("data is invalid!")
	throw parsed.error
}
