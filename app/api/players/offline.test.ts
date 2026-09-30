import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test"
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
