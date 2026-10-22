import { afterEach, beforeEach, expect, spyOn, test } from "bun:test"
import { QueryObserver } from "@tanstack/react-query"
import { initTRPC } from "@trpc/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { OfflinePlayer } from "app/api/players/type"
import superjson from "superjson"
import type { AppRouter } from "./app"
import { compressedPlacesResponseMeta } from "./cache"
import { createAppTRPCClient } from "./client"
import { makeQueryClient } from "./query-client"

const publicPlayers: Record<string, OfflinePlayer> = {
	"player-example": {
		id: "player-example",
		type: "Player",
		isOnline: false,
		username: "Example",
	},
}
let directory: Record<string, OfflinePlayer>
const requests: { url: URL; cache: string | null }[] = []
const queryClients: ReturnType<typeof makeQueryClient>[] = []
let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, "fetch">>
const t = initTRPC.create({ transformer: superjson })
const router = t.router({
	compressedPlaces: t.procedure.query(() => []),
	offlinePlayers: t.procedure.query(() => directory),
	wikiContent: t.procedure.query(() => "private"),
	wikiArticle: t.procedure.query(() => "private article"),
})

beforeEach(() => {
	directory = publicPlayers
	requests.length = 0
	fetchSpy = spyOn(globalThis, "fetch").mockImplementation((async (
		...[input, init]: Parameters<typeof fetch>
	) => {
		const req = new Request(input, init)
		const res = await fetchRequestHandler({
			endpoint: "/api/trpc",
			req,
			router,
			responseMeta: (opts) => compressedPlacesResponseMeta(req, opts),
		})
		requests.push({
			url: new URL(req.url),
			cache: res.headers.get("Vercel-CDN-Cache-Control"),
		})
		return res
	}) as typeof fetch)
})

afterEach(() => {
	fetchSpy.mockRestore()
	for (const queryClient of queryClients.splice(0)) queryClient.clear()
})

function setupClient() {
	const queryClient = makeQueryClient()
	queryClients.push(queryClient)
	const client = createAppTRPCClient(queryClient, "http://localhost/api/trpc")
	const trpc = createTRPCOptionsProxy<AppRouter>({ client, queryClient })
	return { client, trpc, queryClient }
}

test("public queries use individual cacheable requests alongside private batches", async () => {
	const { client } = setupClient()
	const [, players] = await Promise.all([
		client.compressedPlaces.query(),
		client.offlinePlayers.query(),
		client.wikiContent.query({ name: "Example" }),
		client.wikiArticle.query({ name: "Example" }),
	])
	expect(players).toEqual(publicPlayers)
	expect(requests).toHaveLength(3)
	for (const [path, cache] of [
		["compressedPlaces", "public, max-age=86400"],
		["offlinePlayers", "public, max-age=3600"],
	] as const) {
		const request = requests.find(({ url }) =>
			url.pathname.endsWith(`/${path}`),
		)
		expect(request?.cache).toBe(cache)
		expect(request?.url.searchParams.has("batch")).toBe(false)
	}
	const batch = requests.find(
		({ url }) => url.searchParams.get("batch") === "1",
	)
	expect(batch?.url.pathname).toBe("/api/trpc/wikiContent,wikiArticle")
	expect(batch?.cache).toBeNull()
})

test("offline observers stay fresh through focus and remount until the hourly refresh", async () => {
	const { queryClient, trpc } = setupClient()
	const options = trpc.offlinePlayers.queryOptions()
	await queryClient.fetchQuery(options)
	const initialTime = Date.now()
	const now = spyOn(Date, "now").mockReturnValue(initialTime + 31_000)
	try {
		const observer = new QueryObserver(queryClient, options)
		const unsubscribe = observer.subscribe(() => {})
		expect(observer.getCurrentResult().isStale).toBe(false)
		queryClient.getQueryCache().onFocus()
		unsubscribe()
		const remounted = new QueryObserver(queryClient, options)
		const unmount = remounted.subscribe(() => {})
		expect(remounted.getCurrentResult().isStale).toBe(false)
		unmount()
		await queryClient.fetchQuery(options)
		expect(requests).toHaveLength(1)
		expect(queryClient.getQueryCache().find(options)?.gcTime).toBe(3_600_000)

		now.mockReturnValue(initialTime + 3_600_001)
		await queryClient.fetchQuery(options)
		expect(requests).toHaveLength(2)
	} finally {
		now.mockRestore()
	}
})

test("an empty fallback stays stale and a later directory response can recover", async () => {
	const { queryClient, trpc } = setupClient()
	const options = trpc.offlinePlayers.queryOptions()
	directory = {}
	expect(await queryClient.fetchQuery(options)).toEqual({})
	expect(await queryClient.fetchQuery(options)).toEqual({})
	expect(requests).toHaveLength(2)
	expect(requests.every(({ cache }) => cache === null)).toBe(true)

	directory = publicPlayers
	expect(await queryClient.fetchQuery(options)).toEqual(publicPlayers)
	expect(requests).toHaveLength(3)
	expect(requests[2]?.cache).toBe("public, max-age=3600")
	await queryClient.fetchQuery(options)
	expect(requests).toHaveLength(3)
})
