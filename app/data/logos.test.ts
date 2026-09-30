import { afterEach, beforeEach, expect, mock, test } from "bun:test"
import type { DataType } from "app/data"

mock.module("server-only", () => ({}))
const { resolveLogos } = await import("./logos")

const originalFetch = globalThis.fetch
const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const company = {
	i: "company",
	name: "Example Air",
	type: "AirAirline",
	link: "https://wiki.minecartrapidtransit.net/index.php/Old_Name",
}
const line = {
	i: "line",
	name: "Example Air Northern Line",
	code: "N",
	company: "company",
}
const fixture = (companies = [company], lines = [line]) =>
	({
		companies: {
			list: companies,
			map: new Map(companies.map((c) => [c.i, c])),
		},
		connectionLines: { list: lines },
	}) as unknown as DataType
let selectedFile: string | null
let leadImage: string
let generationStatus: number
let selectedId: string

beforeEach(() => {
	selectedFile = "Company_logo.png"
	leadImage = "Screenshot.png"
	generationStatus = 200
	selectedId = "company"
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key"
	globalThis.fetch = mock(async (input: string | URL | Request) => {
		const url = new URL(input instanceof Request ? input.url : input.toString())
		if (url.hostname === "generativelanguage.googleapis.com") {
			if (generationStatus !== 200)
				return Response.json(
					{
						error: {
							code: generationStatus,
							message: "Unavailable",
							status: "PERMISSION_DENIED",
						},
					},
					{ status: generationStatus },
				)
			return Response.json({
				candidates: [
					{
						content: {
							role: "model",
							parts: [
								{
									text: JSON.stringify({
										selections: [{ id: selectedId, file: selectedFile }],
									}),
								},
							],
						},
						finishReason: "STOP",
					},
				],
			})
		}
		if (url.searchParams.get("list") === "allimages")
			return Response.json({
				query: {
					allimages: [
						"Company_logo.png",
						"Northern_Line_logo.png",
						"Western_Line_logo.png",
						"RapidRoute-Explicit_Air.png",
						"Screenshot.png",
					].map((name) => ({ name, timestamp: "2026-01-01" })),
				},
			})
		if (url.searchParams.get("prop") === "imageinfo")
			return Response.json({
				query: {
					pages: (url.searchParams.get("titles") ?? "")
						.split("|")
						.map((title) => ({
							title,
							imageinfo: [
								{
									url: `https://example.com/${title.slice(5)}`,
									width: 400,
									height: 100,
									descriptionurl: `https://example.com/${title}`,
								},
							],
						})),
				},
			})
		return Response.json({
			query: {
				normalized: [{ from: "Old_Name", to: "Old Name" }],
				redirects: [{ from: "Old Name", to: "Example Air" }],
				pages: [
					{
						title: "Example Air Northern Line",
						fullurl: "https://example.com/Northern_Line",
						images: [{ title: "File:Northern_Line_logo.png" }],
						revisions: [
							{
								slots: {
									main: {
										content: "The Northern Line is operated by Example Air.",
									},
								},
							},
						],
					},
					{
						title: "Western Line",
						fullurl: "https://example.com/MRT_Western_Line",
						images: [{ title: "File:Western_Line_logo.png" }],
						revisions: [
							{
								slots: {
									main: { content: "The Western Line is operated by MRT." },
								},
							},
						],
					},
					{
						title: "Example Air",
						fullurl:
							"https://wiki.minecartrapidtransit.net/index.php/Example_Air",
						pageimage: leadImage,
						images: [
							{ title: "File:Company logo.png" },
							{ title: "File:Screenshot.png" },
							{ title: "File:Western_Line_logo.png" },
						],
						revisions: [
							{
								slots: {
									main: {
										content:
											"{{Infobox airline|logo=Company logo.png}} The screenshot shows an aircraft, not a logo.",
									},
								},
							},
						],
					},
				],
			},
		})
	}) as unknown as typeof fetch
})

afterEach(() => {
	globalThis.fetch = originalFetch
	if (originalKey === undefined)
		Reflect.deleteProperty(process.env, "GOOGLE_GENERATIVE_AI_API_KEY")
	else process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey
})

test("the model selects a page logo over a screenshot and retains the resolved wiki source", async () => {
	const logos = await resolveLogos(fixture())
	expect(logos.company?.logo?.file).toBe("Company_logo.png")
	expect(logos.company?.sourcePage?.url).toBe(
		"https://wiki.minecartrapidtransit.net/index.php/Example_Air",
	)
	expect(logos.company?.sourcePage?.title).toBe("Example Air")
	expect(logos.line?.logo?.file).toBe("Northern_Line_logo.png")
})

test("model output cannot invent a file outside its candidates", async () => {
	selectedFile = "Unrelated_logo.png"
	const logos = await resolveLogos(fixture())
	expect(logos.company).toBeUndefined()
})

test("the model can decline a guess", async () => {
	selectedFile = null
	const logos = await resolveLogos(fixture())
	expect(logos.company).toBeUndefined()
})

test("wiki overrides take priority over model guesses", async () => {
	const logos = await resolveLogos(
		fixture([{ ...company, name: "Explicit Air" }], []),
	)
	expect(logos.company?.source).toBe("override")
	expect(logos.company?.logo?.file).toBe("RapidRoute-Explicit_Air.png")
})

test("model failure keeps the heuristic logo and its actual wiki source", async () => {
	generationStatus = 403
	leadImage = "Company_logo.png"
	const logos = await resolveLogos(fixture())
	expect(logos.company?.logo?.file).toBe("Company_logo.png")
	expect(logos.company?.sourcePage?.url).toBe(
		"https://wiki.minecartrapidtransit.net/index.php/Example_Air",
	)
})

test("the model also selects logos for non-MRT lines", async () => {
	selectedId = "line"
	selectedFile = "Northern_Line_logo.png"
	const logos = await resolveLogos(fixture())
	expect(logos.line?.source).toBe("AI guess")
	expect(logos.line?.logo?.file).toBe("Northern_Line_logo.png")
})

test("concurrent registry and API requests share the logo refresh", async () => {
	const data = fixture()
	const [registry, api] = await Promise.all([
		resolveLogos(data),
		resolveLogos(data),
	])
	expect(registry).toBe(api)
	const again = await resolveLogos(data)
	expect(again).toBe(registry)
})

test("a shared line name cannot borrow a logo from another company", async () => {
	selectedId = "line"
	selectedFile = "Western_Line_logo.png"
	const logos = await resolveLogos(
		fixture(
			[company, { ...company, i: "mrt", name: "MRT" }],
			[
				{ ...line, name: "Western Line" },
				{ ...line, i: "mrt-line", company: "mrt", name: "MRT Western Line" },
			],
		),
	)
	expect(logos.line).toBeUndefined()
})
