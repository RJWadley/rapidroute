/** Only the public build-time dataset can be shared at the CDN. */
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
		) ||
		!info.calls.every((call) => call.path === "compressedPlaces")
	)
		return {}
	// Vercel CDN keys include the deployment URL: a new build gets fresh data.
	return {
		headers: new Headers({
			"Vercel-CDN-Cache-Control": "public, max-age=86400",
			"Cache-Control": "public, max-age=0, must-revalidate",
		}),
	}
}
