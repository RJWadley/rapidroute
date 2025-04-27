import { z } from "zod"

const mrtLinesSchema = z.enum([
	"arctic",
	"beach",
	"circle",
	"desert",
	"eastern",
	"forest",
	"savannah",
	"island",
	"jungle",
	"lakeshore",
	"mesa",
	"northern",
	"oasis",
	"plains",
	"rose",
	"southern",
	"taiga",
	"union",
	"valley",
	"western",
	"expo",
	"zephyr",
])

const otherKeysSchema = z.enum([
	"chunky.markerset",
	"cities",
	"old",
	"airports",
	"roads.a",
	"roads.b",
	"markers",
])

const lineTypeSchema = z.strictObject({
	color: z.string(),
	markup: z.boolean(),
	x: z.array(z.number()),
	y: z.array(z.number()),
	weight: z.number(),
	z: z.array(z.number()),
	label: z.string(),
	opacity: z.number(),
})

const markerTypeSchema = z.strictObject({
	markup: z.boolean(),
	x: z.number(),
	icon: z.string(),
	y: z.number(),
	dim: z.enum(["16x16", "32x32"]),
	z: z.number(),
	label: z.string(),
})

const markerSetSchema = z.strictObject({
	hide: z.boolean(),
	circles: z.unknown(),
	areas: z.unknown(),
	label: z.string(),
	markers: z.record(markerTypeSchema),
	lines: z.record(lineTypeSchema),
	layerprio: z.number(),
})

const setsSchema = z.record(
	z.union([otherKeysSchema, mrtLinesSchema]),
	markerSetSchema,
)

const markersResponseSchema = z.strictObject({
	sets: setsSchema,
	timestamp: z.number(),
})

/**
 * parse as markers reponse without ever throwing
 *
 * will cast in the event of a failure
 */
export const parseMarkersWithFallback = (markers: unknown) => {
	const { data, error } = markersResponseSchema.safeParse(markers)

	if (markers && error) console.warn("invalid markers", error.issues)

	return {
		warnings: error,
		data: data ?? (markers as typeof data) ?? null,
	}
}

export type MarkerData = ReturnType<typeof parseMarkersWithFallback>["data"]

export type MRTLineName = z.infer<typeof mrtLinesSchema>
export const isMRTLine = (line: string): line is MRTLineName =>
	mrtLinesSchema.safeParse(line).success

export type MRTStopData = z.infer<typeof markerTypeSchema>
export type MRTLineData = z.infer<typeof lineTypeSchema> & { key: string }
