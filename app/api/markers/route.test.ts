import { afterEach, expect, mock, spyOn, test } from "bun:test"
import { GET } from "./route"

const originalFetch = globalThis.fetch

afterEach(() => {
	globalThis.fetch = originalFetch
	mock.restore()
})

test("shares successful marker data through browser and CDN caches", async () => {
	const markers = { sets: {}, timestamp: 123 }
	globalThis.fetch = mock(async () =>
		Response.json(markers),
	) as unknown as typeof fetch

	const response = await GET()
	expect(response.status).toBe(200)
	expect(await response.json()).toEqual(markers)
	expect(response.headers.get("Cache-Control")).toBe(
		"public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600",
	)
})

test("upstream errors remain retryable and cannot poison the shared cache", async () => {
	spyOn(console, "error").mockImplementation(() => {})
	for (const fetchMarkers of [
		async () => new Response("unavailable", { status: 503 }),
		async () => new Response("invalid JSON"),
		async () => {
			throw new Error("Network unavailable")
		},
	]) {
		globalThis.fetch = mock(fetchMarkers) as unknown as typeof fetch
		const response = await GET()
		expect(response.status).toBe(503)
		expect(response.headers.get("Cache-Control")).toBe("no-store")
		expect(response.headers.get("Retry-After")).toBe("60")
	}
})
