import { afterEach, beforeEach, expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))
const { getWikiArticle } = await import("./article")

const WIKI = "https://wiki.minecartrapidtransit.net"
const PHOTO = "Deadbush Pioneer district in Jul 2018.png"
const originalFetch = globalThis.fetch
const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
let requests: URL[]
let content: string
let missing: boolean
let disambiguation: boolean
let imageStatus: number
let articleStatus: number
let searchResults: { nearmatch: string[]; title: string[]; text: string[] }
let missingTitles: Set<string>

beforeEach(() => {
	requests = []
	missing = disambiguation = false
	imageStatus = articleStatus = 200
	searchResults = { nearmatch: [], title: [], text: [] }
	missingTitles = new Set()
	content = `<div class="mw-parser-output">
		<section class="mf-section-0">
		<style>.infobox { color: red; }</style>
		<div class="hatnote"><p>Unrelated notice.</p></div>
		<table class="infobox"><tr><td><p>Infobox boilerplate.</p></td></tr></table>
		<p>Kyoto is a town in <b>Ward 9</b>.<sup class="reference">[1]</sup></p>
		<p>The town is served by the Northern Line.<noscript><img src="/images/line.png"></noscript><span class="lazy-image-placeholder" data-mw-src="/images/line.png" data-mw-srcset="/images/line@2x.png 2x" data-width="30" data-height="30" data-alt="Northern Line"></span></p>
		</section>
		<div class="mw-heading mw-heading2"><h2>History</h2></div>
		<p>Later article section, outside the introduction.</p>
		<div class="thumb"><img src="/images/${PHOTO.replaceAll(" ", "_")}"><div class="thumbcaption">The Pioneer district in July 2018.</div></div>
	</div>`
	// Having a key must never cause this path to call the generation provider.
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-curated-key"
	const fetch = mock(async (input: string | URL | Request) => {
		const url = new URL(input instanceof Request ? input.url : input.toString())
		requests.push(url)
		if (url.origin !== WIKI || url.pathname !== "/api.php")
			throw new Error("The curated view may only fetch the wiki API")
		if (url.searchParams.get("list") === "search") {
			const mode = url.searchParams.get("srwhat")
			if (mode !== "nearmatch" && mode !== "title" && mode !== "text")
				throw new Error("Unexpected wiki search mode")
			return Response.json({
				query: {
					search: searchResults[mode].map((title) => ({ title, snippet: "" })),
				},
			})
		}
		if (url.searchParams.get("action") === "parse") {
			if (articleStatus !== 200)
				return new Response("Wiki unavailable", { status: articleStatus })
			const title = url.searchParams.get("page")
			if (missing || missingTitles.has(title ?? ""))
				return Response.json({ error: { code: "missingtitle" } })
			return Response.json({
				parse: {
					title: title === "Airport alias" ? "Canonical Airport" : title,
					text: { "*": content },
					categories: disambiguation ? [{ "*": "Disambiguation_pages" }] : [],
					links: [],
					// The selected photo sits beyond the agent's first twelve candidates.
					images: [
						"Town_flag.png",
						...Array.from({ length: 13 }, (_, i) => `Other_image_${i}.png`),
						PHOTO.replaceAll(" ", "_"),
					],
				},
			})
		}
		if (url.searchParams.get("prop") === "imageinfo") {
			if (imageStatus !== 200)
				return new Response("Images unavailable", { status: imageStatus })
			return Response.json({
				query: {
					pages: (url.searchParams.get("titles") ?? "")
						.split("|")
						.map((title) => ({
							title,
							imageinfo: [
								{
									url: `${WIKI}/images/${encodeURIComponent(title.slice(5))}`,
									thumburl: `${WIKI}/images/thumb/${encodeURIComponent(title.slice(5))}`,
									width: 1200,
									height: 800,
									thumbwidth: 600,
									thumbheight: 400,
								},
							],
						})),
				},
			})
		}
		throw new Error("The wiki-only view must not inspect image pixels")
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

test("curated Kyoto reads Ward 9 and copies the wiki lead without generation", async () => {
	const result = await getWikiArticle("Kyoto", {
		id: "Kyoto",
		world: "New",
	})
	expect(result?.title).toBe("Kyoto (Ward 9)")
	expect(result?.synopsis).toBe(
		"Kyoto is a town in Ward 9.\n\nThe town is served by the Northern Line.",
	)
	expect(result?.content).toContain("Later article section")
	expect(result?.content).toContain(`src="${WIKI}/images/line.png"`)
	expect(result?.content).toContain(`srcset="${WIKI}/images/line@2x.png 2x"`)
	expect(result?.content).toContain('width="30" height="30"')
	expect(result?.content).not.toContain("lazy-image-placeholder")
	expect(result?.content).not.toContain("<noscript>")
	expect(result?.sources).toEqual([
		{
			title: "Kyoto (Ward 9)",
			url: `${WIKI}/index.php/Kyoto_(Ward_9)`,
		},
	])
	expect(result?.highlights).toBeUndefined()
	expect(result?.mostProminentImage).toBeUndefined()
	expect(requests.every((url) => url.origin === WIKI)).toBe(true)
	expect(requests.some((url) => url.searchParams.has("list"))).toBe(false)
	const articleRequest = requests.find(
		(url) => url.searchParams.get("action") === "parse",
	)
	expect(articleRequest?.searchParams.get("mobileformat")).toBe("1")
})

test("mobile article headings remain readable without the wiki's collapse scripts", async () => {
	content = `<section class="mf-section-0"><p>Kyoto is a town.</p></section>
		<h2 class="section-heading" onclick="mfTempOpenSection(1)"><span class="indicator mf-icon mf-icon-expand"></span><span id="History">History</span></h2>
		<section class="mf-section-1 collapsible-block"><p>The town's original history.</p></section>`
	const result = await getWikiArticle("Kyoto", { id: "Kyoto", world: "New" })
	expect(result?.content).toContain('id="History"')
	expect(result?.content).toContain("The town's original history.")
	expect(result?.content).not.toContain("mfTempOpenSection")
	expect(result?.content).not.toContain("mf-icon-expand")
})

test("unmapped destinations still look up original wiki text without generation", async () => {
	searchResults.nearmatch = ["London"]
	content =
		"<p>London is a city documented on the MRT Wiki.</p><h2>History</h2><p>Original history.</p>"
	const result = await getWikiArticle("London", { id: "London", type: "Town" })
	expect(result?.title).toBe("London")
	expect(result?.synopsis).toBe("London is a city documented on the MRT Wiki.")
	expect(result?.content).toContain("Original history.")
	expect(result?.sources).toEqual([
		{ title: "London", url: `${WIKI}/index.php/London` },
	])
	expect(
		requests.some((url) => url.searchParams.get("srsearch") === "London"),
	).toBe(true)
	expect(requests.every((url) => url.origin === WIKI)).toBe(true)
	expect(result?.highlights).toBeUndefined()
})

test("title matches take priority over full-text search results", async () => {
	searchResults.nearmatch = ["London"]
	searchResults.title = ["London City"]
	searchResults.text = ["Another city"]
	const result = await getWikiArticle("London")
	expect(result?.title).toBe("London")
	expect(result?.match).toBe("exact")
	expect(
		requests
			.filter((url) => url.searchParams.get("action") === "parse")
			.map((url) => url.searchParams.get("page")),
	).toEqual(["London"])
})

test("partial title matches beat articles that only mention Chokster", async () => {
	searchResults.title = ["Chokster City", "Chokster City Borderline Airport"]
	searchResults.text = ["Clanda Resort", "CBA", "Alli City", "Chokster City"]
	content = "<p>Chokster City is a city on the MRT server.</p>"
	const result = await getWikiArticle("Chokster", {
		id: "Chokster",
		type: "Town",
	})
	expect(result?.title).toBe("Chokster City")
	expect(result?.synopsis).toBe("Chokster City is a city on the MRT server.")
	expect(result?.sources).toEqual([
		{ title: "Chokster City", url: `${WIKI}/index.php/Chokster_City` },
	])
	expect(
		requests
			.filter((url) => url.searchParams.get("action") === "parse")
			.map((url) => url.searchParams.get("page")),
	).toEqual(["Chokster City"])
	expect(requests.every((url) => url.origin === WIKI)).toBe(true)
})

test("full-text results display original text with a related-article label", async () => {
	searchResults.text = [
		"Marblelake Heathrow International Airport",
		"Marblegate",
	]
	content =
		"<p>The airport serves the city of Marblegate, with a bus stop named Marblegate-Lakeview Heathrow Airport.</p>"
	const result = await getWikiArticle("Marblegate-Lakeview Heathrow Airport", {
		id: "IntraBus-Marblegate-Lakeview+Heathrow+Airport",
		type: "BusStop",
	})
	expect(result?.title).toBe("Marblelake Heathrow International Airport")
	expect(result?.synopsis).toBe(
		"The airport serves the city of Marblegate, with a bus stop named Marblegate-Lakeview Heathrow Airport.",
	)
	expect(result?.type).toBe("generic")
	expect(result?.match).toBe("related")
	expect(result?.highlights).toBeUndefined()
	expect(requests.every((url) => url.origin === WIKI)).toBe(true)
})

test("stale search results do not hide a later available article", async () => {
	searchResults.text = ["Missing article", "Unmapped destination history"]
	missingTitles.add("Missing article")
	const result = await getWikiArticle("Unmapped destination")
	expect(result?.title).toBe("Unmapped destination history")
})

test("a missing curated article falls back to ordinary wiki search", async () => {
	missingTitles.add("Kyoto (Ward 9)")
	searchResults.text = ["Kyoto history"]
	const result = await getWikiArticle("Kyoto", { id: "Kyoto" })
	expect(result?.title).toBe("Kyoto history")
	expect(result?.match).toBe("related")
})

test("only the manually selected photo is used, even after twelve other images", async () => {
	const result = await getWikiArticle("Deadbush", { id: "Deadbush" })
	expect(result?.imageSource?.file).toBe(PHOTO)
	expect(result?.imageSource?.description).toBe(
		"The Pioneer district in July 2018.",
	)
	expect(result?.mostProminentImage).toBe(
		`${WIKI}/images/thumb/${encodeURIComponent(PHOTO)}`,
	)
	expect(result?.imageSource?.url).toBe(
		`${WIKI}/index.php/File%3ADeadbush_Pioneer_district_in_Jul_2018.png`,
	)
	expect(requests).toHaveLength(2)
})

test("no wiki search results leave the manual search link available", async () => {
	expect(await getWikiArticle("Uncurated place")).toBeNull()
	expect(requests).toHaveLength(3)
	expect(
		requests.every((url) => url.searchParams.get("list") === "search"),
	).toBe(true)
})

test("a station cannot borrow a same-name town's curation", async () => {
	expect(await getWikiArticle("Kyoto", { id: "ExampleRail-KYO" })).toBeNull()
	expect(
		requests.some((url) => url.searchParams.get("action") === "parse"),
	).toBe(false)
})

test("world guards prevent an old-world destination from borrowing a new-world article", async () => {
	expect(
		await getWikiArticle("Kyoto", { id: "Kyoto", world: "Old" }),
	).toBeNull()
	expect(requests).toHaveLength(0)
})

test("catalog wiki links resolve redirects and retain the canonical source", async () => {
	const result = await getWikiArticle(
		"Example Airport",
		{ id: "EXA" },
		`${WIKI}/index.php/Airport_alias`,
	)
	expect(result?.title).toBe("Canonical Airport")
	expect(result?.url).toBe(`${WIKI}/index.php/Canonical_Airport`)
	expect(result?.mostProminentImage).toBeUndefined()
})

test("manual curation takes priority over an outdated catalog link", async () => {
	await getWikiArticle(
		"Kyoto",
		{ id: "Kyoto" },
		`${WIKI}/index.php/Wrong_article`,
	)
	expect(requests[0]?.searchParams.get("page")).toBe("Kyoto (Ward 9)")
})

test("non-wiki and malformed catalog links fall back to search without fetching those links", async () => {
	for (const link of [
		"https://example.com/index.php/Airport",
		`${WIKI}/index.php/%ZZ`,
		`${WIKI}/api.php`,
		`${WIKI}@example.com/index.php/Airport`,
	])
		expect(
			await getWikiArticle("Example Airport", { id: "EXA" }, link),
		).toBeNull()
	expect(
		requests.every(
			(url) => url.origin === WIKI && url.searchParams.get("list") === "search",
		),
	).toBe(true)
})

test("missing articles return null and disambiguation articles remain readable with a warning", async () => {
	missing = true
	expect(await getWikiArticle("Kyoto")).toBeNull()
	missing = false
	disambiguation = true
	const categorized = await getWikiArticle("Kyoto")
	expect(categorized?.match).toBe("ambiguous")
	expect(categorized?.type).toBe("generic")
	expect(categorized?.content).toContain("Later article section")
	disambiguation = false
	content = "<p>Kyoto may refer to several different places.</p>"
	expect((await getWikiArticle("Kyoto"))?.match).toBe("ambiguous")
})

test("unavailable photo metadata keeps the article readable", async () => {
	imageStatus = 503
	const result = await getWikiArticle("Deadbush")
	expect(result?.synopsis).toContain("Kyoto is a town")
	expect(result?.mostProminentImage).toBeUndefined()
	expect(result?.content).toContain("Later article section")
})

test("an article without a lead retains the full article and does not generate a replacement", async () => {
	content =
		"<div class='mw-parser-output'><h2>Details</h2><p>Original section.</p></div>"
	const result = await getWikiArticle("Kyoto")
	expect(result?.synopsis).toBeNull()
	expect(result?.content).toContain("Original section.")
})

test("long introductions are bounded without losing the full article", async () => {
	const original = "A documented wiki sentence. ".repeat(100)
	content = `<p>${original}</p><h2>Details</h2>`
	const result = await getWikiArticle("Kyoto")
	expect(result?.synopsis?.length).toBeLessThanOrEqual(1001)
	expect(result?.synopsis?.endsWith("…")).toBe(true)
	expect(result?.content).toContain(original.trim())
})

test("wiki outages surface an error for the article retry action", async () => {
	articleStatus = 503
	await expect(getWikiArticle("Kyoto")).rejects.toThrow(
		"The wiki request failed",
	)
})
