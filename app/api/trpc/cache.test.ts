import { expect, test } from "bun:test"
import { initTRPC } from "@trpc/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { compressedPlacesResponseMeta } from "./cache"

const t = initTRPC.create({ transformer: superjson })
const publicPlayers = {
	"player-example": {
		id: "player-example",
		type: "Player",
		isOnline: false,
		username: "Example",
	},
}
const handle = (
	path: string,
	{
		method = "GET",
		headers = {},
		offlinePlayers = () => publicPlayers as object,
	}: {
		method?: string
		headers?: Record<string, string>
		offlinePlayers?: () => object
	} = {},
) => {
	const router = t.router({
		compressedPlaces: t.procedure.query(() => ["public"]),
		offlinePlayers: t.procedure.query(offlinePlayers),
		live: t.procedure.query(() => "live"),
		fail: t.procedure.query(() => {
			throw new Error("failed")
		}),
	})
	const req = new Request(`http://localhost/api/trpc/${path}`, {
		method,
		headers,
	})
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router,
		responseMeta: (opts) => compressedPlacesResponseMeta(req, opts),
	})
}
test("individual and pure batches cache, mixed and error responses do not", async () => {
	for (const path of [
		"compressedPlaces",
		"compressedPlaces,compressedPlaces?batch=1",
	]) {
		const res = await handle(path)
		expect(res.status).toBe(200)
		expect(res.headers.get("Vercel-CDN-Cache-Control")).toBe(
			"public, max-age=86400",
		)
		expect(res.headers.get("Cache-Control")).toBe(
			"public, max-age=0, must-revalidate",
		)
	}
	for (const path of [
		"live",
		"fail",
		"compressedPlaces,live?batch=1",
		"compressedPlaces,fail?batch=1",
		"missing",
	]) {
		expect((await handle(path)).headers.has("Vercel-CDN-Cache-Control")).toBe(
			false,
		)
	}
})
test("successful nonempty offline directories cache for one hour", async () => {
	for (const path of [
		"offlinePlayers",
		"offlinePlayers,offlinePlayers?batch=1",
	]) {
		const res = await handle(path)
		expect(res.status).toBe(200)
		expect(res.headers.get("Vercel-CDN-Cache-Control")).toBe(
			"public, max-age=3600",
		)
		expect(res.headers.get("Cache-Control")).toBe(
			"public, max-age=0, must-revalidate",
		)
	}
})
test("mixed offline directory batches and failed or empty directories never cache", async () => {
	for (const path of [
		"offlinePlayers,live?batch=1",
		"offlinePlayers,fail?batch=1",
		"offlinePlayers,compressedPlaces?batch=1",
	]) {
		expect((await handle(path)).headers.has("Vercel-CDN-Cache-Control")).toBe(
			false,
		)
	}
	for (const offlinePlayers of [
		() => ({}),
		() => {
			throw new Error("Directory unavailable")
		},
	]) {
		for (const path of [
			"offlinePlayers",
			"offlinePlayers,offlinePlayers?batch=1",
		])
			expect(
				(await handle(path, { offlinePlayers })).headers.has(
					"Vercel-CDN-Cache-Control",
				),
			).toBe(false)
	}
})
test("POST and JSONL streaming never cache", async () => {
	for (const path of ["compressedPlaces", "offlinePlayers"]) {
		expect(
			(await handle(path, { method: "POST" })).headers.has(
				"Vercel-CDN-Cache-Control",
			),
		).toBe(false)
		const res = await handle(`${path}?batch=1`, {
			headers: { "trpc-accept": "application/jsonl" },
		})
		expect(res.headers.has("Vercel-CDN-Cache-Control")).toBe(false)
		await res.text()
	}
})

test("real SSE responses never cache", async () => {
	// Happy DOM's TransformStream cannot be consumed by Bun's ReadableStream.
	const check = Bun.spawn(
		[
			process.execPath,
			"--eval",
			`
			import assert from "node:assert/strict";
			import { initTRPC } from "@trpc/server";
			import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
			import { compressedPlacesResponseMeta } from "./app/api/trpc/cache";
			const t = initTRPC.create();
			const router = t.router({ offlinePlayers: t.procedure.subscription(async function* () { yield { player: "public" }; }) });
			const req = new Request("http://localhost/api/trpc/offlinePlayers");
			const res = await fetchRequestHandler({ endpoint: "/api/trpc", req, router, responseMeta: opts => compressedPlacesResponseMeta(req, opts) });
			assert.equal(res.status, 200);
			assert.equal(res.headers.get("content-type"), "text/event-stream");
			assert.equal(res.headers.has("Vercel-CDN-Cache-Control"), false);
			assert.match(await res.text(), /public/);
			`,
		],
		{ stdout: "pipe", stderr: "pipe" },
	)
	const [exitCode, stderr] = await Promise.all([
		check.exited,
		new Response(check.stderr).text(),
	])
	expect(exitCode, stderr).toBe(0)
})

test("invalid or incomplete directory results never cache", () => {
	const req = new Request("http://localhost")
	for (const data of [
		[{}],
		[{ result: {} }],
		[{ result: { data: null } }],
		[{ result: { data: [] } }],
		[{ result: { data: "not a directory" } }],
		[{ result: { data: publicPlayers } }, { result: { data: {} } }],
	])
		expect(
			compressedPlacesResponseMeta(req, {
				info: { calls: data.map(() => ({ path: "offlinePlayers" })) },
				type: "query",
				errors: [],
				eagerGeneration: false,
				data,
			}).headers,
		).toBeUndefined()
})
test("missing, empty, incomplete, subscription and failed metadata never cache", () => {
	const req = new Request("http://localhost")
	const good = {
		info: { calls: [{ path: "compressedPlaces" }] },
		type: "query",
		errors: [],
		eagerGeneration: false,
		data: [{ result: { data: [] } }],
	}
	for (const override of [
		{ info: undefined },
		{ info: { calls: [] } },
		{ data: [] },
		{ data: [{ error: {} }] },
		{ errors: [new Error()] },
		{ type: "subscription" },
		{ eagerGeneration: true },
	])
		expect(
			compressedPlacesResponseMeta(req, { ...good, ...override }).headers,
		).toBeUndefined()
})
