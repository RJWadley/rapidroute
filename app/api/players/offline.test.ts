import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test"
import { initTRPC } from "@trpc/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { compressedPlacesResponseMeta } from "../trpc/cache"
import { getOfflinePlayers } from "./offline"

const originalFetch = globalThis.fetch
let errors: ReturnType<typeof spyOn<typeof console, "error">>
const sheetResponse = (usernames: (string | number | null)[], status = 200) =>
	new Response(
		`/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify({
			status: "ok",
			table: {
				cols: [{ id: "B", label: "Username", type: "string" }],
				rows: usernames.map((v) => ({ c: [v === null ? null : { v }] })),
			},
		})});`,
		{ status, headers: { "content-type": "application/javascript" } },
	)

const t = initTRPC.create({ transformer: superjson })
const router = t.router({
	offlinePlayers: t.procedure.query(() => getOfflinePlayers()),
})
function directoryResponse() {
	const req = new Request("http://localhost/api/trpc/offlinePlayers")
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router,
		responseMeta: (opts) => compressedPlacesResponseMeta(req, opts),
	})
}

async function readDirectoryResponse(response: Response) {
	const body = (await response.json()) as {
		result: { data: Parameters<typeof superjson.deserialize>[0] }
	}
	return superjson.deserialize<Awaited<ReturnType<typeof getOfflinePlayers>>>(
		body.result.data,
	)
}

beforeEach(() => {
	errors = spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
	globalThis.fetch = originalFetch
	errors.mockRestore()
})

test("reads the member tab directly instead of an expired Apps Script redirect", async () => {
	const requests: URL[] = []
	globalThis.fetch = mock(async (input: string | URL | Request) => {
		const url = new URL(input instanceof Request ? input.url : input.toString())
		requests.push(url)
		if (
			url.hostname === "docs.google.com" &&
			url.pathname ===
				"/spreadsheets/d/1Hhj_Cghfhfs8Xh5v5gt65kGc4mDW0sC5GWULKidOBW8/gviz/tq" &&
			url.searchParams.get("gid") === "1267599469" &&
			url.searchParams.get("headers") === "1" &&
			url.searchParams.get("tq") === "select B"
		)
			return sheetResponse(["ExamplePlayer"])
		return new Response("<!DOCTYPE html><title>Page Not Found</title>", {
			status: 400,
		})
	}) as unknown as typeof fetch

	expect(await getOfflinePlayers()).toEqual({
		"player-exampleplayer": {
			id: "player-exampleplayer",
			type: "Player",
			isOnline: false,
			username: "ExamplePlayer",
		},
	})
	expect(requests).toHaveLength(1)
	expect(errors).not.toHaveBeenCalled()
})

test("preserves numeric usernames and omits blank spreadsheet rows", async () => {
	globalThis.fetch = mock(async () =>
		sheetResponse([" ExamplePlayer ", 12345, null, "", "  "]),
	) as unknown as typeof fetch

	const players = await getOfflinePlayers()
	expect(Object.keys(players).sort()).toEqual([
		"player-12345",
		"player-exampleplayer",
	])
	expect(players["player-12345"]?.username).toBe("12345")
})

test("preserves directory order across responses without shuffling the server list", async () => {
	globalThis.fetch = mock(async () =>
		sheetResponse(["Zed", "Alice", "Middle"]),
	) as unknown as typeof fetch
	const random = spyOn(Math, "random").mockReturnValue(0)
	try {
		for (let i = 0; i < 2; i++)
			expect(Object.keys(await getOfflinePlayers())).toEqual([
				"player-zed",
				"player-alice",
				"player-middle",
			])
	} finally {
		random.mockRestore()
	}
})

test("a validated nonempty spreadsheet becomes a cacheable tRPC directory", async () => {
	globalThis.fetch = mock(async () =>
		sheetResponse([" ExamplePlayer ", null, ""]),
	) as unknown as typeof fetch
	const res = await directoryResponse()
	expect(res.status).toBe(200)
	expect(res.headers.get("Vercel-CDN-Cache-Control")).toBe(
		"public, max-age=3600",
	)
	expect(await readDirectoryResponse(res)).toEqual({
		"player-exampleplayer": {
			id: "player-exampleplayer",
			type: "Player",
			isOnline: false,
			username: "ExamplePlayer",
		},
	})
})

test("empty spreadsheets and directory failures cannot become cached tRPC successes", async () => {
	for (const source of [
		async () => sheetResponse([]),
		async () => sheetResponse([null, "", "  "]),
		async () => sheetResponse(["ExamplePlayer"], 503),
		async () => new Response("not a spreadsheet"),
		async () =>
			new Response("<title>Unavailable</title>", {
				headers: { "content-type": "text/html" },
			}),
		async () => {
			throw new Error("Network unavailable")
		},
	]) {
		globalThis.fetch = mock(source) as unknown as typeof fetch
		const res = await directoryResponse()
		expect(res.status).toBe(200)
		expect(res.headers.has("Vercel-CDN-Cache-Control")).toBe(false)
		expect(await readDirectoryResponse(res)).toEqual({})
	}
})

test("an HTTP error cannot be accepted as a player directory", async () => {
	globalThis.fetch = mock(async () =>
		sheetResponse(["ExamplePlayer"], 400),
	) as unknown as typeof fetch

	expect(await getOfflinePlayers()).toEqual({})
	expect(errors).toHaveBeenCalledTimes(1)
	expect((errors.mock.calls[0]?.[1] as Error).message).toContain("400")
})

test("an HTML error page produces one useful diagnostic", async () => {
	globalThis.fetch = mock(
		async () =>
			new Response("<!DOCTYPE html><title>Page Not Found</title>", {
				headers: { "content-type": "text/html; charset=utf-8" },
			}),
	) as unknown as typeof fetch

	expect(await getOfflinePlayers()).toEqual({})
	expect(errors).toHaveBeenCalledTimes(1)
	expect(errors.mock.calls[0]?.[1]).toBeInstanceOf(Error)
	expect((errors.mock.calls[0]?.[1] as Error).message).toContain("text/html")
})

test("an unexpected sheet header cannot silently turn totals into usernames", async () => {
	globalThis.fetch = mock(async () => {
		const response = sheetResponse([741])
		return new Response((await response.text()).replace("Username", "Total"))
	}) as unknown as typeof fetch

	expect(await getOfflinePlayers()).toEqual({})
	expect(errors).toHaveBeenCalledTimes(1)
})

test("a network failure leaves search available and reports the failure once", async () => {
	globalThis.fetch = mock(async () => {
		throw new Error("Network unavailable")
	}) as unknown as typeof fetch

	expect(await getOfflinePlayers()).toEqual({})
	expect(errors).toHaveBeenCalledTimes(1)
})
