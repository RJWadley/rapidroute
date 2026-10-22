export const dynamic = "force-dynamic"

export async function GET() {
	// Share one map response instead of embedding it in every place/route page.
	try {
		const response = await fetch(
			"https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
			{ signal: AbortSignal.timeout(10000) },
		)
		if (!response.ok)
			throw new Error(`Dynmap markers returned HTTP ${response.status}`)
		return Response.json(await response.json(), {
			headers: {
				"Cache-Control":
					"public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600",
			},
		})
	} catch (error) {
		console.error("Map markers are temporarily unavailable", error)
		return Response.json(
			{ error: "Map markers are temporarily unavailable" },
			{
				status: 503,
				headers: { "Cache-Control": "no-store", "Retry-After": "60" },
			},
		)
	}
}
