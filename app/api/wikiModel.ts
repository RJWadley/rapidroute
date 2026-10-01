import "server-only"
import { createGoogle } from "@ai-sdk/google"

// Cache successful generations by model, prompt, and schema alongside wiki data.
const google = createGoogle({
	fetch: Object.assign(
		(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) =>
			fetch(input, {
				...init,
				cache: "force-cache",
				next: { revalidate: 86400 },
			}),
		{ preconnect: fetch.preconnect },
	),
})

export const getWikiModelId = () =>
	process.env.GOOGLE_WIKI_MODEL || "gemini-3.5-flash-lite"

export const getWikiModel = () => google(getWikiModelId())
