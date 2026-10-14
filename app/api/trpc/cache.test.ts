import { expect, test } from "bun:test"
import { initTRPC } from "@trpc/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { compressedPlacesResponseMeta } from "./cache"

const t = initTRPC.create()
const router = t.router({
	compressedPlaces: t.procedure.query(() => ["public"]),
	live: t.procedure.query(() => "live"),
	fail: t.procedure.query(() => {
		throw new Error("failed")
	}),
})
const handle = (path: string, method = "GET", headers = {}) => {
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
test("POST and JSONL streaming never cache", async () => {
	expect(
		(await handle("compressedPlaces", "POST")).headers.has(
			"Vercel-CDN-Cache-Control",
		),
	).toBe(false)
	const res = await handle("compressedPlaces?batch=1", "GET", {
		"trpc-accept": "application/jsonl",
	})
	expect(res.headers.has("Vercel-CDN-Cache-Control")).toBe(false)
	await res.text()
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
