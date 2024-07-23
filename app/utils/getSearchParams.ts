const { headers } =
	typeof window === "undefined" ? require("next/headers") : { headers: null }

export const getSearchParams = () => {
	// if we're on the server, parse the URL from the headers (see middleware.ts)
	if (headers) {
		// get the full URL
		const headersList = headers()
		const fullUrl = headersList.get("x-next-url")
		if (!fullUrl) throw new Error("Cannot find x-next-url header")
		const url = new URL(fullUrl)

		// get the search params
		return new URLSearchParams(url.search)
	}

	return new URLSearchParams(window.location.search)
}
