import type { NextRequest } from "next/server"
import { findPath } from "."
import { data, type ExcludedRoutes } from "app/data"

/**
 * find a path between two locations on the server-side
 * includes from and to in request
 */
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams

	const excludedRoutes = JSON.parse(
		searchParams.get("excludedRoutes") ?? "throw",
	) as ExcludedRoutes

	const path = findPath(
		searchParams.get("from"),
		searchParams.get("to"),
		excludedRoutes,
		data,
	)

	return new Response(JSON.stringify(path), {
		headers: {
			"content-type": "application/json",
		},
	})
}
