import "server-only"
import { createClient } from "node-wreq"
import type { Dispatcher } from "undici"

const client = createClient({
	// Match Gatelogue's browser network profile without launching a browser.
	browser: "chrome_145",
	timeout: 10000,
	// Node fetch enforces the caller's redirect policy itself.
	redirect: "manual",
})

/** Keep Node/Next fetch's cache and stream handling, changing only its transport. */
export const wikiDispatcher = {
	dispatch(
		options: Dispatcher.DispatchOptions,
		handler: Dispatcher.DispatchHandler,
	) {
		const controller = new AbortController()
		let resume: (() => void) | undefined
		let reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>> | undefined
		controller.signal.addEventListener(
			"abort",
			() => {
				resume?.()
				void reader?.cancel(controller.signal.reason).catch(() => {})
			},
			{ once: true },
		)
		handler.onConnect?.((error) => controller.abort(error))

		const send = async () => {
			if (options.method !== "GET" && options.method !== "HEAD")
				throw new Error("Wiki transport only supports read-only requests")
			const headers: Record<string, string> = {}
			if (Array.isArray(options.headers)) {
				for (let i = 0; i < options.headers.length; i += 2)
					headers[String(options.headers[i])] = String(options.headers[i + 1])
			} else {
				for (const [name, value] of Object.entries(options.headers ?? {}))
					if (value !== undefined)
						headers[name] = Array.isArray(value)
							? value.join(", ")
							: String(value)
			}
			const response = await client.fetch(`${options.origin}${options.path}`, {
				method: options.method,
				headers,
				signal: controller.signal,
			})
			const rawHeaders: Buffer[] = []
			for (const [name, value] of response.headers) {
				// The native client already decodes compressed bodies.
				if (name === "content-encoding" || name === "content-length") continue
				rawHeaders.push(Buffer.from(name), Buffer.from(value))
			}
			reader = response.body?.getReader()
			try {
				controller.signal.throwIfAborted()
				handler.onHeaders?.(
					response.status,
					rawHeaders,
					() => resume?.(),
					response.statusText,
				)
				while (reader) {
					controller.signal.throwIfAborted()
					const { done, value } = await reader.read()
					controller.signal.throwIfAborted()
					if (done) break
					const ready = new Promise<void>((resolve) => {
						resume = resolve
					})
					if (handler.onData?.(Buffer.from(value)) === false) await ready
				}
				handler.onComplete?.([])
			} finally {
				resume = undefined
				await reader?.cancel().catch(() => {})
				reader?.releaseLock()
			}
		}
		void send().catch((error: unknown) =>
			handler.onError?.(
				error instanceof Error ? error : new Error(String(error)),
			),
		)
		return true
	},
}
