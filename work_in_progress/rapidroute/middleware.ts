import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
	const requestHeaders = new Headers(request.headers)

	const requestURL = request.url
	requestHeaders.set("x-next-url", requestURL)

	return NextResponse.next({
		request: {
			// New request headers
			headers: requestHeaders,
		},
	})
}
