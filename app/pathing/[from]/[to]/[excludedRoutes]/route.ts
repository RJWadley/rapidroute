import { type ExcludedRoutes, data } from "app/data"
import type { NextRequest } from "next/server"
import { findPath } from "../../.."

export const dynamic = "error"

/**
 * find a path between two locations on the server-side
 * includes from and to in request
 */
export async function GET(
	_request: Request,
	{
		params,
	}: { params: Promise<{ from: string; to: string; excludedRoutes: string }> },
) {
	const excludedRoutes = JSON.parse(
		(await params).excludedRoutes,
	) as ExcludedRoutes

	const path = findPath(
		(await params).from,
		(await params).to,
		excludedRoutes,
		data,
	)

	return new Response(JSON.stringify(path), {
		headers: {
			"content-type": "application/json",
		},
	})
}
