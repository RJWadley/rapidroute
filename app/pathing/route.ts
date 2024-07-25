import type { NextRequest } from "next/server"
import { findPath } from "."

export const runtime = "edge"

/**
 * find a path between two locations on the server-side
 * includes from and to in request
 */
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams

	const path = findPath(searchParams.get("from"), searchParams.get("to"))

	return new Response(JSON.stringify(path), {
		headers: {
			"content-type": "application/json",
		},
	})
}
