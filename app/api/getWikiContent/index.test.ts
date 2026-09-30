import { afterEach, beforeEach, expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))
const { getWikiContent } = await import("./index")
const { WikiResearch } = await import("./wiki")
const { streamWikiContent } = await import("./stream")
import type { WikiResearchEvent } from "./types"

const WIKI = "https://wiki.minecartrapidtransit.net"
const PIXELS =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zc5sAAAAASUVORK5CYII="
const originalFetch = globalThis.fetch
const originalModel = process.env.GOOGLE_WIKI_MODEL
const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
type ToolCall = { name: string; args: Record<string, unknown> }
const calls = (...tools: ToolCall[]) =>
	tools.map((functionCall) => ({ functionCall, thoughtSignature: "dGVzdA==" }))
const final = (overrides: Record<string, unknown> = {}) =>
	calls({
		name: "finishResearch",
		args: {
			match: "exact",
			articleTitle: "Kyoto (Ward 9)",
			synopsis: "Kyoto in Ward 9 is a town served by the Northern Railway.",
			sourceTitles: ["Kyoto (Ward 9)", "Northern Railway", "Invented citation"],
			imageId: "File:Kyoto Centre.png",
			imageDescription: "A view of Kyoto's buildings.",
			...overrides,
		},
	})
type Parts = ReturnType<typeof calls> | ReturnType<typeof final>
let replies: Parts[]
let replyIndex: number
let generationStatus: number
let imageStatus: number
let imageUrl: string
let imageBytes: Uint8Array<ArrayBuffer>
let requestedModel: string
let requests: Record<string, unknown>[]
let urls: URL[]
let caseId = 0
const request = () =>
	getWikiContent("Kyoto", {
		id: `test-${caseId}`,
		type: "Town",
		world: "New",
		coordinates: [120, -90],
		codes: ["KYO"],
	})

beforeEach(() => {
	caseId++
	replyIndex = 0
	generationStatus = imageStatus = 200
	imageUrl = `${WIKI}/images/thumb/Kyoto_Centre.png/600px-Kyoto_Centre.png`
	imageBytes = Buffer.from(PIXELS, "base64")
	requestedModel = ""
	requests = []
	urls = []
	replies = [
		calls({ name: "searchWiki", args: { query: "Kyoto" } }),
		calls({ name: "readWikiPage", args: { title: "Kyoto" } }),
		calls(
			{ name: "readWikiPage", args: { title: "Kyoto alias" } },
			{ name: "readWikiPage", args: { title: "Northern Railway" } },
		),
		calls({ name: "inspectWikiImage", args: { id: "File:Kyoto Centre.png" } }),
		final(),
	]
	Reflect.deleteProperty(process.env, "GOOGLE_WIKI_MODEL")
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key"
	globalThis.fetch = mock(
		async (input: string | URL | Request, init?: RequestInit) => {
			const url = new URL(
				input instanceof Request ? input.url : input.toString(),
			)
			urls.push(url)
			if (init?.signal?.aborted) throw init.signal.reason
			if (url.hostname === "generativelanguage.googleapis.com") {
				requestedModel = url.pathname.split("/").at(-1)?.split(":")[0] ?? ""
				const body = JSON.parse(String(init?.body)) as {
					generationConfig?: { responseMimeType?: string }
					toolConfig?: { functionCallingConfig?: { mode?: string } }
				}
				requests.push(body)
				// Match the real Gemini API constraint found during live verification.
				if (
					body.toolConfig?.functionCallingConfig?.mode === "ANY" &&
					body.generationConfig?.responseMimeType === "application/json"
				)
					return Response.json(
						{
							error: {
								code: 400,
								message: "Forced tools with JSON unsupported",
							},
						},
						{ status: 400 },
					)
				if (generationStatus !== 200)
					return Response.json(
						{
							error: {
								code: generationStatus,
								message: "Model unavailable",
								status: "PERMISSION_DENIED",
							},
						},
						{ status: generationStatus },
					)
				const parts = replies[replyIndex++] ?? final()
				return Response.json({
					candidates: [
						{ content: { role: "model", parts }, finishReason: "STOP" },
					],
					usageMetadata: {
						promptTokenCount: 10,
						candidatesTokenCount: 10,
						totalTokenCount: 20,
					},
				})
			}
			if (url.pathname.startsWith("/images/"))
				return new Response(imageBytes, {
					status: imageStatus,
					headers: { "content-type": "image/png" },
				})
			if (url.searchParams.get("action") === "parse") {
				const title = url.searchParams.get("page")
				if (title === "Kyoto")
					return Response.json({
						parse: {
							title: "Kyoto",
							text: {
								"*": '<p>Kyoto may refer to different towns.</p><a href="/index.php/Kyoto_(Ward_9)">Ward 9</a>',
							},
							links: [{ ns: 0, exists: "", "*": "Kyoto (Ward 9)" }],
							categories: [{ sortkey: "", "*": "Disambiguation_pages" }],
							images: [],
						},
					})
				if (title === "Northern Railway")
					return Response.json({
						parse: {
							title,
							text: {
								"*": "<p>The Northern Railway serves Kyoto in Ward 9.</p>",
							},
							images: [],
							links: [],
						},
					})
				if (title === "Kyoto alias" || title === "Kyoto (Ward 9)")
					return Response.json({
						parse: {
							title: "Kyoto (Ward 9)",
							text: {
								"*": `<p>Kyoto is a town in Ward 9.</p><div class="thumb"><img src="/images/Kyoto_Centre.png" srcset="/images/Kyoto_Centre.png 1x, ${WIKI}/images/Kyoto_Centre.png 2x"><div class="thumbcaption">Kyoto's centre.</div></div>`,
							},
							images: ["Kyoto_Centre.png", "Never_inspected.png"],
							links: [],
						},
					})
				return Response.json({ error: { code: "missingtitle" } })
			}
			if (url.searchParams.get("prop") === "imageinfo")
				return Response.json({
					query: {
						pages: [
							{
								title: "File:Kyoto Centre.png",
								imageinfo: [
									{
										url: imageUrl,
										thumburl: imageUrl,
										width: 1200,
										height: 800,
										thumbwidth: 600,
										thumbheight: 400,
									},
								],
							},
							{
								title: "File:Never inspected.png",
								imageinfo: [
									{
										url: `${WIKI}/images/Never_inspected.png`,
										width: 600,
										height: 400,
									},
								],
							},
						],
					},
				})
			return Response.json({
				query: {
					search: [
						{ title: "Kyoto", pageid: 1, snippet: "Different Kyoto towns." },
						{
							title: "Kyoto (Ward 9)",
							pageid: 2,
							snippet: "A town in Ward 9.",
						},
					],
				},
			})
		},
	) as unknown as typeof fetch
})

afterEach(() => {
	globalThis.fetch = originalFetch
	if (originalModel === undefined)
		Reflect.deleteProperty(process.env, "GOOGLE_WIKI_MODEL")
	else process.env.GOOGLE_WIKI_MODEL = originalModel
	if (originalKey === undefined)
		Reflect.deleteProperty(process.env, "GOOGLE_GENERATIVE_AI_API_KEY")
	else process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey
})

test("the real agent loop resolves a later candidate, follows a redirect, and cites only read pages", async () => {
	const result = await request()
	expect(result?.title).toBe("Kyoto (Ward 9)")
	expect(result?.url).toBe(`${WIKI}/index.php/Kyoto_(Ward_9)`)
	expect(result?.synopsis).toContain("Northern Railway")
	expect(result?.sources.map((source) => source.title)).toEqual([
		"Kyoto (Ward 9)",
		"Northern Railway",
	])
	expect(requests).toHaveLength(5)
	const contents = requests[0]?.contents as { parts: { text: string }[] }[]
	const prompt = JSON.parse(contents[0]?.parts[0]?.text ?? "{}") as {
		context: { coordinates: number[]; codes: string[] }
	}
	expect(prompt.context.coordinates).toEqual([120, -90])
	expect(prompt.context.codes).toEqual(["KYO"])
	expect(JSON.stringify(requests.at(-1))).toContain(
		'"thoughtSignature":"dGVzdA=="',
	)
	expect(result?.content).not.toContain(`${WIKI}${WIKI}`)
})

test("image inspection sends pixels to Gemini and selects the wiki-provided thumbnail", async () => {
	const result = await request()
	const sent = JSON.stringify(requests.at(-1))
	expect(sent).toContain('"inlineData"')
	expect(sent).toContain(PIXELS)
	expect(sent).toContain("image/png")
	expect(result?.mostProminentImage).toBe(imageUrl)
	expect(result?.imageSource?.url).toBe(
		`${WIKI}/index.php/File%3AKyoto_Centre.png`,
	)
	expect(result?.imageSource?.description).toBe("A view of Kyoto's buildings.")
})

test("an image mentioned in the article cannot be selected without successful inspection", async () => {
	replies[4] = final({ imageId: "File:Never inspected.png" })
	const result = await request()
	expect(result?.synopsis).toBeTruthy()
	expect(result?.mostProminentImage).toBeUndefined()
})

test("invented article selections fall back to the original article", async () => {
	replies[4] = final({ articleTitle: "Invented article" })
	const result = await request()
	expect(result?.title).toBe("Kyoto")
	expect(result?.synopsis).toBeNull()
	expect(result?.sources).toEqual([
		{ title: "Kyoto", url: `${WIKI}/index.php/Kyoto` },
	])
})

test("a failed image does not prevent a grounded summary", async () => {
	imageStatus = 404
	const result = await request()
	expect(result?.synopsis).toBeTruthy()
	expect(result?.mostProminentImage).toBeUndefined()
	expect(JSON.stringify(requests.at(-1))).not.toContain(PIXELS)
})

test("image metadata cannot make the agent fetch an external host", async () => {
	imageUrl = "https://untrusted.example/images/secret.png"
	const result = await request()
	expect(result?.synopsis).toBeTruthy()
	expect(result?.mostProminentImage).toBeUndefined()
	expect(urls.some((url) => url.hostname === "untrusted.example")).toBe(false)
})

test("image byte limits apply even without a content-length header", async () => {
	imageBytes = new Uint8Array(2 * 1024 * 1024 + 1)
	const result = await request()
	expect(result?.synopsis).toBeTruthy()
	expect(result?.mostProminentImage).toBeUndefined()
	expect(JSON.stringify(requests.at(-1))).not.toContain('"inlineData"')
})

test("the model can decline to match a destination", async () => {
	replies = [
		...replies.slice(0, 1),
		final({
			match: "none",
			articleTitle: null,
			synopsis: null,
			sourceTitles: [],
			imageId: null,
			imageDescription: null,
		}),
	]
	expect(await request()).toBeNull()
	expect(requests).toHaveLength(2)
})

test("unresolved disambiguation is retained instead of claiming an exact match", async () => {
	replies = [
		...replies.slice(0, 2),
		final({
			match: "ambiguous",
			articleTitle: "Kyoto",
			synopsis: "Kyoto can refer to several towns.",
			sourceTitles: ["Kyoto"],
			imageId: null,
			imageDescription: null,
		}),
	]
	const result = await request()
	expect(result?.type).toBe("generic")
	expect(result?.match).toBe("ambiguous")
})

test("a name-only request cannot turn a known disambiguation into an arbitrary exact match", async () => {
	const result = await getWikiContent("Kyoto")
	expect(result?.title).toBe("Kyoto")
	expect(result?.match).toBe("ambiguous")
	expect(result?.synopsis).toContain("different towns")
	expect(result?.mostProminentImage).toBeUndefined()
})

test("research is bounded and reserves the final call for its answer", async () => {
	replies = Array.from({ length: 5 }, (_, i) =>
		calls({ name: "searchWiki", args: { query: `Kyoto variant ${i}` } }),
	)
	replies.push(
		final({
			match: "none",
			articleTitle: null,
			synopsis: null,
			sourceTitles: [],
			imageId: null,
			imageDescription: null,
		}),
	)
	expect(await request()).toBeNull()
	expect(requests).toHaveLength(6)
	expect(
		urls.filter((url) => url.searchParams.get("list") === "search"),
	).toHaveLength(12)
	expect(requests.at(-1)?.tools).toEqual([
		{
			functionDeclarations: [
				expect.objectContaining({ name: "finishResearch" }),
			],
		},
	])
})

test("model failures preserve the wiki and remain retryable", async () => {
	generationStatus = 403
	const failed = await request()
	expect(failed?.title).toBe("Kyoto")
	expect(failed?.content).toContain("Kyoto may refer")
	expect(failed?.synopsis).toBeNull()
	generationStatus = 200
	expect((await request())?.synopsis).toBeTruthy()
})

test("the shared wiki model override is used by the agent", async () => {
	process.env.GOOGLE_WIKI_MODEL = "gemini-flash-latest"
	await request()
	expect(requestedModel).toBe("gemini-flash-latest")
})

test("concurrent and repeated destination requests share successful daily research", async () => {
	const [first, second] = await Promise.all([request(), request()])
	expect(first).toEqual(second)
	await request()
	expect(requests).toHaveLength(5)
})

test("an absent API key still loads the original wiki article", async () => {
	Reflect.deleteProperty(process.env, "GOOGLE_GENERATIVE_AI_API_KEY")
	expect((await request())?.title).toBe("Kyoto")
	expect(requests).toHaveLength(0)
})

test("aborted wiki tools stop their network requests", async () => {
	const wiki = new WikiResearch(AbortSignal.timeout(10000))
	await expect(wiki.search("Kyoto", AbortSignal.abort())).rejects.toThrow()
})

test("guide highlights cite read pages and discard ungrounded highlights", async () => {
	replies[4] = final({
		highlights: [
			{
				label: "Getting there",
				detail: "The Northern Railway serves Kyoto.",
				sourceTitles: ["Northern Railway"],
			},
			{
				label: "Invented",
				detail: "An unsupported claim.",
				sourceTitles: ["Never read"],
			},
		],
	})
	const result = await request()
	expect(result?.highlights).toEqual([
		{
			label: "Getting there",
			detail: "The Northern Railway serves Kyoto.",
			sources: [
				{
					title: "Northern Railway",
					url: `${WIKI}/index.php/Northern_Railway`,
				},
			],
		},
	])
})

test("ambiguous guides cannot show destination-specific highlights", async () => {
	replies = [
		...replies.slice(0, 2),
		final({
			match: "ambiguous",
			articleTitle: "Kyoto",
			imageId: null,
			highlights: [
				{
					label: "Getting there",
					detail: "Choose a railway.",
					sourceTitles: ["Kyoto"],
				},
			],
		}),
	]
	expect((await request())?.highlights).toEqual([])
})

test("streaming reports actual evidence counts and shares one research run with the query", async () => {
	const context = { id: `stream-${caseId}`, type: "Town" }
	const events: WikiResearchEvent[] = []
	const stream = (async () => {
		for await (const event of streamWikiContent("Kyoto", context))
			events.push(event)
	})()
	const result = await getWikiContent("Kyoto", context)
	await stream
	const progress = events.flatMap((event) =>
		event.type === "progress" ? [event.progress] : [],
	)
	expect(progress.map((event) => event.stage)).toContain("searching")
	expect(progress.map((event) => event.stage)).toContain("reading")
	expect(progress.map((event) => event.stage)).toContain("images")
	expect(Math.max(...progress.map((event) => event.pagesRead))).toBe(3)
	expect(Math.max(...progress.map((event) => event.imagesChecked))).toBe(1)
	expect(events.at(-1)).toEqual({ type: "result", content: result })
	expect(requests).toHaveLength(5)
	const cachedEvents: WikiResearchEvent[] = []
	for await (const event of streamWikiContent("Kyoto", context))
		cachedEvents.push(event)
	expect(cachedEvents).toEqual([{ type: "result", content: result }])
	expect(requests).toHaveLength(5)
})

test("leaving a stream does not cancel research needed by another reader", async () => {
	const context = { id: `cancelled-stream-${caseId}`, type: "Town" }
	const controller = new AbortController()
	const stream = streamWikiContent("Kyoto", context, controller.signal)
	expect((await stream.next()).value?.type).toBe("progress")
	controller.abort()
	expect((await stream.next()).done).toBe(true)
	expect((await getWikiContent("Kyoto", context))?.synopsis).toBeTruthy()
	expect(requests).toHaveLength(5)
})

test("a streamed model failure still delivers the original article", async () => {
	generationStatus = 403
	const events: WikiResearchEvent[] = []
	for await (const event of streamWikiContent("Kyoto", {
		id: `fallback-stream-${caseId}`,
	}))
		events.push(event)
	expect(
		events.some(
			(event) =>
				event.type === "progress" && event.progress.stage === "fallback",
		),
	).toBe(true)
	expect(events.at(-1)).toEqual({
		type: "result",
		content: expect.objectContaining({ title: "Kyoto", synopsis: null }),
	})
})

test("stream failures terminate instead of waiting indefinitely", async () => {
	await expect(streamWikiContent(" ").next()).rejects.toThrow(
		"name is required",
	)
})
