import "server-only"
import { getWikiModelId } from "app/api/wikiModel"
import { WikiRequestError } from "app/api/wikiRequest"
import { researchWiki } from "./agent"
import type { WikiContext } from "./input"
import type { WikiContent, WikiProgress } from "./types"
import { WikiResearch } from "./wiki"

const cached = new Map<string, { expires: number; content: WikiContent }>()
const pending = new Map<
	string,
	{
		request: Promise<WikiContent | null>
		state: {
			progress?: WikiProgress
			listeners: Set<(progress: WikiProgress) => void>
		}
	}
>()

export async function getWikiContent(
	query: string,
	context?: WikiContext,
	onProgress?: (progress: WikiProgress) => void,
) {
	const name = query.trim()
	if (!name) throw new Error("name is required")
	const key = JSON.stringify({
		name,
		context,
		model: getWikiModelId(),
		version: 2,
	})
	const existing = cached.get(key)
	if (existing && existing.expires > Date.now()) return existing.content
	const inFlight = pending.get(key)
	if (inFlight) {
		if (onProgress) {
			inFlight.state.listeners.add(onProgress)
			if (inFlight.state.progress) onProgress(inFlight.state.progress)
		}
		return inFlight.request.finally(() => {
			if (onProgress) inFlight.state.listeners.delete(onProgress)
		})
	}
	const state: {
		progress?: WikiProgress
		listeners: Set<(progress: WikiProgress) => void>
	} = { listeners: new Set(onProgress ? [onProgress] : []) }
	const request = resolveWikiContent(name, context, (progress) => {
		state.progress = progress
		for (const listener of state.listeners) listener(progress)
	})
		.then((content) => {
			// Share successful research across requests; failed summaries remain retryable.
			if (content?.synopsis) {
				if (cached.size >= 200) {
					const oldest = cached.keys().next().value
					if (oldest !== undefined) cached.delete(oldest)
				}
				cached.set(key, { expires: Date.now() + 86400000, content })
			}
			return content
		})
		.finally(() => pending.delete(key))
	pending.set(key, { request, state })
	return request
}

async function resolveWikiContent(
	name: string,
	context?: WikiContext,
	onProgress?: (progress: WikiProgress) => void,
): Promise<WikiContent | null> {
	if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
		try {
			return await researchWiki(name, context, onProgress)
		} catch (error) {
			// The article fallback uses the same blocked API; surface the retry state.
			if (error instanceof WikiRequestError && error.blocked) throw error
			console.warn(
				"Wiki research failed; showing the original article when available.",
			)
		}
	}
	// Keep the wiki readable if the model or its tools are unavailable.
	onProgress?.({ stage: "fallback", pagesRead: 0, imagesChecked: 0 })
	const wiki = new WikiResearch(AbortSignal.timeout(15000))
	const candidates = await wiki.search(name)
	for (const candidate of candidates.slice(0, 3)) {
		const page = await wiki.read(candidate.title)
		if (!page) continue
		return {
			type:
				page.title.toLowerCase() === name.toLowerCase()
					? "specific"
					: "generic",
			match: null,
			title: page.title,
			url: page.url,
			content: page.content,
			synopsis: null,
			sources: [{ title: page.title, url: page.url }],
		}
	}
	return null
}
