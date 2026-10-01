import "server-only"
import { getWikiContent } from "./index"
import type { WikiContext } from "./input"
import type { WikiResearchEvent } from "./types"

/** Share the same research and cache as the query, with live tool progress. */
export async function* streamWikiContent(
	name: string,
	context?: WikiContext,
	signal?: AbortSignal,
): AsyncGenerator<WikiResearchEvent> {
	if (signal?.aborted) return
	const events: WikiResearchEvent[] = []
	let resume: () => void = () => {}
	let finished = false
	let closed = false
	let failure: unknown
	const push = (event: WikiResearchEvent) => {
		if (closed) return
		events.push(event)
		resume()
	}
	const abort = () => resume()
	signal?.addEventListener("abort", abort, { once: true })
	// The shared request continues for other readers and populates the cache even
	// when this subscriber leaves. No second model run is needed on reconnect.
	void getWikiContent(name, context, (progress) =>
		push({ type: "progress", progress }),
	)
		.then((content) => push({ type: "result", content }))
		.catch((error: unknown) => {
			failure = error
		})
		.finally(() => {
			finished = true
			resume()
		})
	try {
		while (!finished || events.length) {
			if (signal?.aborted) return
			const event = events.shift()
			if (event) yield event
			else
				await new Promise<void>((resolve) => {
					resume = resolve
				})
		}
		if (failure) throw failure
	} finally {
		closed = true
		signal?.removeEventListener("abort", abort)
	}
}
