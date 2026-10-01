import { afterEach, beforeEach, expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))
const { getWikiArticle } = await import("./article")
const { getWikiContent } = await import("./index")

const originalFetch = globalThis.fetch
const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const name = "Kleinsburg West Side"
const context = { id: "IntraBus-Kleinsburg+West+Side", type: "BusStop" }
let title: string
let content: string

beforeEach(() => {
	title = "Oparia LeTourneau International Airport"
	content =
		"<p>The mayor's city of Kleinsburg was promoted at the same time as Oparia.</p><p>A road runs along the west side of the airport.</p>"
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key"
	const fetch = mock(async (input: string | URL | Request) => {
		const url = new URL(input instanceof Request ? input.url : input.toString())
		if (url.hostname === "generativelanguage.googleapis.com")
			return Response.json(
				{ error: { message: "Model unavailable" } },
				{ status: 403 },
			)
		if (url.searchParams.get("list") === "search")
			return Response.json({
				query: {
					search:
						url.searchParams.get("srwhat") === "text"
							? [{ title, snippet: "Kleinsburg ... west side" }]
							: [],
				},
			})
		if (url.searchParams.get("action") === "parse")
			return Response.json({
				parse: { title, text: { "*": content }, images: [], links: [] },
			})
		throw new Error(`Unexpected request: ${url.origin}${url.pathname}`)
	})
	globalThis.fetch = Object.assign(fetch, {
		preconnect: originalFetch.preconnect,
	})
})

afterEach(() => {
	globalThis.fetch = originalFetch
	if (originalKey === undefined)
		Reflect.deleteProperty(process.env, "GOOGLE_GENERATIVE_AI_API_KEY")
	else process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey
})

const modes = ["wiki only", "missing model key", "failed model"] as const
const read = (mode: (typeof modes)[number]) => {
	if (mode === "wiki only") return getWikiArticle(name, context)
	if (mode === "missing model key")
		Reflect.deleteProperty(process.env, "GOOGLE_GENERATIVE_AI_API_KEY")
	return getWikiContent(name, context)
}

for (const mode of modes) {
	test(`${mode} rejects the unrelated airport returned for Kleinsburg West Side`, async () => {
		expect(await read(mode)).toBeNull()
	})

	test(`${mode} retains a related article that names the actual bus stop`, async () => {
		title = "IntraBus"
		content = "<p>IntraBus serves the Kleinsburg West Side bus stop.</p>"
		expect((await read(mode))?.title).toBe("IntraBus")
	})

	test(`${mode} does not confuse the stop with a longer place name`, async () => {
		title = "Kleinsburg West Sideways"
		content = "<p>Kleinsburg West Sideways is a different place.</p>"
		expect(await read(mode)).toBeNull()
	})
}
