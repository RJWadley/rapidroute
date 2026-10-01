import assert from "node:assert/strict"
import { createServer } from "node:http"
import { after, before, test } from "node:test"
import { gzipSync } from "node:zlib"
import { fetchWiki } from "./wikiRequest"
let origin: string
let cancelled: () => void = () => {}
const payload = { title: "Chokster City" }
const server = createServer((request, response) => {
	// A real HTTP boundary that distinguishes browser transport from plain fetch.
	if (!request.headers["sec-ch-ua"]) {
		response.writeHead(403, { "cf-mitigated": "challenge" })
		response.end("<title>Just a moment...</title>")
		return
	}
	if (request.url === "/redirect") {
		response.writeHead(302, { location: "/headers" })
		response.end()
	} else if (request.url === "/slow") {
		request.on("close", () => cancelled())
	} else if (request.url === "/stream") {
		response.writeHead(200, { "content-type": "image/png" })
		const timer = setInterval(() => response.write(Buffer.alloc(65536)), 5)
		response.on("close", () => {
			clearInterval(timer)
			cancelled()
		})
	} else if (request.url === "/gzip") {
		const bytes = gzipSync(JSON.stringify(payload))
		response.writeHead(200, {
			"content-type": "application/json",
			"content-encoding": "gzip",
			"content-length": bytes.length,
		})
		response.end(bytes)
	} else {
		response.writeHead(200, { "content-type": "application/json" })
		response.end(JSON.stringify(request.headers))
	}
})

before(async () => {
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
	const address = server.address()
	if (!address || typeof address === "string")
		throw new Error("No HTTP fixture")
	origin = `http://127.0.0.1:${address.port}`
})
after(() => {
	server.closeAllConnections()
	server.close()
})

test("wiki requests combine browser transport with RapidRoute identification", async () => {
	const response = await fetchWiki(`${origin}/headers`)
	const headers = (await response.json()) as Record<string, string>
	assert.match(headers["sec-ch-ua"] ?? "", /Chromium/)
	assert.equal(
		headers["user-agent"],
		"RapidRoute/4.0 (+https://github.com/RJWadley/rapidroute)",
	)
})

test("compressed wiki responses are decoded exactly once", async () => {
	const response = await fetchWiki(`${origin}/gzip`)
	assert.deepEqual(await response.json(), payload)
})

test("wiki image redirects remain forbidden", async () => {
	await assert.rejects(fetchWiki(`${origin}/redirect`, { redirect: "error" }))
})

test("aborting wiki requests cancels the native request", async () => {
	const controller = new AbortController()
	const closed = new Promise<void>((resolve) => {
		cancelled = resolve
	})
	const pending = fetchWiki(`${origin}/slow`, { signal: controller.signal })
	setTimeout(() => controller.abort(), 50)
	await assert.rejects(pending)
	await closed
})

test("cancelling an image body stops its native download", async () => {
	const closed = new Promise<void>((resolve) => {
		cancelled = resolve
	})
	const response = await fetchWiki(`${origin}/stream`)
	const reader = response.body?.getReader()
	if (!reader) throw new Error("Missing image body")
	assert.ok((await reader.read()).value?.byteLength)
	await reader.cancel()
	await closed
})
