import "server-only"

const USER_AGENT = "RapidRoute/4.0 (+https://github.com/RJWadley/rapidroute)"

export class WikiRequestError extends Error {
	readonly blocked: boolean

	constructor(
		readonly status: number,
		challenge: boolean,
		url: string,
	) {
		super(
			`The wiki request failed (${status}${challenge ? "; Cloudflare challenge" : ""}): ${url}`,
		)
		this.name = "WikiRequestError"
		this.blocked = status === 403 && challenge
	}
}

/** Identify wiki requests consistently and retain useful upstream failures. */
export async function fetchWiki(url: string, options: RequestInit = {}) {
	const headers = new Headers(options.headers)
	headers.set("User-Agent", USER_AGENT)
	const response = await fetch(url, {
		...options,
		headers,
		signal: options.signal ?? AbortSignal.timeout(10000),
	})
	if (!response.ok)
		throw new WikiRequestError(
			response.status,
			response.headers.get("cf-mitigated") === "challenge",
			url,
		)
	return response
}
