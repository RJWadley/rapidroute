/** Only complete public dataset/directory responses can be shared at the CDN. */
export function compressedPlacesResponseMeta(
	request: Request,
	{
		info,
		type,
		errors,
		eagerGeneration,
		data,
	}: {
		info: { calls: readonly { path: string }[] } | undefined
		type: string
		errors: readonly unknown[]
		eagerGeneration: boolean
		data: readonly unknown[]
	},
) {
	if (
		request.method !== "GET" ||
		type !== "query" ||
		// Streaming responses generate metadata before their errors are known.
		eagerGeneration ||
		errors.length > 0 ||
		!info?.calls.length ||
		data.length !== info.calls.length ||
		data.some(
			(result) => !result || typeof result !== "object" || "error" in result,
		)
	)
		return {}

	const path = info.calls[0]?.path
	// Keep different endpoints separate, even when both are public.
	if (!info.calls.every((call) => call.path === path)) return {}
	let maxAge: number
	if (path === "compressedPlaces") {
		// Vercel CDN keys include the deployment URL: a new build gets fresh data.
		maxAge = 86400
	} else if (path === "offlinePlayers" && data.every(hasNonemptyDirectory)) {
		maxAge = 3600
	} else return {}

	return {
		headers: new Headers({
			"Vercel-CDN-Cache-Control": `public, max-age=${maxAge}`,
			"Cache-Control": "public, max-age=0, must-revalidate",
		}),
	}
}

function hasNonemptyDirectory(response: unknown) {
	if (!response || typeof response !== "object" || !("result" in response))
		return false
	const { result } = response
	if (!result || typeof result !== "object" || !("data" in result)) return false
	const directory = result.data
	// getOfflinePlayers deliberately returns {} when its source is unavailable.
	return (
		!!directory &&
		typeof directory === "object" &&
		!Array.isArray(directory) &&
		Object.keys(directory).length > 0
	)
}
